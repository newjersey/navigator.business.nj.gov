import { ArnFormat, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sns from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";
import {
  STATIC_SITE_CLUSTER_NAME,
  STATIC_SITE_CERTIFICATE_IDS_BY_STAGE,
  STATIC_SITE_HEALTH_CHECK_PATH,
  STATIC_SITE_SERVICE_BASE_NAME,
} from "./constants";
import {
  createStaticSiteAlarms,
  createStaticSiteDeploymentFailureRule,
} from "./staticSiteMonitoring";
import { createStaticSiteOutputs } from "./staticSiteOutputs";
import {
  createStaticSiteImageTag,
  createStaticSiteServiceName,
  createStaticSiteTaskDefinition,
} from "./staticSiteTaskDefinition";
import { applyStandardTags } from "./stackUtils";

/** Properties for creating the per-stage static-site ECS service stack. */
export interface StaticSiteServiceStackProps extends StackProps {
  /** Deployment stage that owns this ECS service, such as dev, testing, content, staging, or prod. */
  readonly stage: string;
}

interface RequiredEnvironmentValue {
  /** Environment variable name to validate. */
  readonly name: string;

  /** Environment variable value to validate. */
  readonly value: string | undefined;
}

interface StaticSiteNetwork {
  /** Imported VPC that contains the private ECS and ALB subnets. */
  readonly vpc: ec2.IVpc;

  /** Private subnets used by the internal ALB and Fargate service. */
  readonly subnets: ec2.ISubnet[];

  /** Existing security group used by the current bfs-navigator ECS service pattern. */
  readonly securityGroup: ec2.ISecurityGroup;
}

interface CreateStaticSiteServiceProps {
  /** Deployment stage used in the ECS service name and tags. */
  readonly stage: string;

  /** ECS cluster that runs the Fargate service. */
  readonly cluster: ecs.ICluster;

  /** Task definition revision that the service should run. */
  readonly taskDefinition: ecs.FargateTaskDefinition;

  /** Imported VPC, private subnet, and security group resources used by the service. */
  readonly network: StaticSiteNetwork;
}

/**
 * Number of static-site tasks to run initially.
 *
 * The first deployment is intentionally single-instance because autoscaling is out of scope and the
 * external WAF can retry against the same internal ALB origin.
 */
const STATIC_SITE_DESIRED_COUNT = 1;

/**
 * Maximum healthy percentage for rolling ECS deployments.
 *
 * Two hundred percent allows ECS to start one replacement task before stopping the existing task
 * when subnet capacity is available.
 */
const STATIC_SITE_DEPLOYMENT_MAX_PERCENT = 200;

/**
 * Minimum healthy percentage for rolling ECS deployments.
 *
 * Zero percent lets a single-task service recover from bad or stuck tasks without requiring a
 * second healthy task to exist first.
 */
const STATIC_SITE_DEPLOYMENT_MIN_HEALTHY_PERCENT = 0;

/** HTTP ingress port retained for existing upstream origin routing to the static-site ALB. */
const STATIC_SITE_HTTP_INGRESS_PORT = 80;

/** HTTPS ingress port used by the static-site ALB listener. */
const STATIC_SITE_HTTPS_INGRESS_PORT = 443;

const requireEnvironmentValue = (props: RequiredEnvironmentValue): string => {
  if (props.value === undefined || props.value.trim().length === 0) {
    throw new Error(`${props.name} must be set to deploy the static site service`);
  }

  return props.value;
};

const createStaticSiteAlbName = (stage: string): string => {
  return `${STATIC_SITE_SERVICE_BASE_NAME}-${stage}-alb`;
};

const createStaticSiteTargetGroupName = (stage: string): string => {
  return `${STATIC_SITE_SERVICE_BASE_NAME}-${stage}-tg`;
};

/** Resolve the ACM certificate ID for the static-site stage being deployed. */
const requireStaticSiteCertificateId = (stage: string): string => {
  const certificateId = STATIC_SITE_CERTIFICATE_IDS_BY_STAGE[stage];

  if (!certificateId) {
    throw new Error(`No static-site ACM certificate ID configured for stage '${stage}'.`);
  }

  return certificateId;
};

/** CDK stack that runs the static site in ECS Fargate behind an internal ALB. */
export class StaticSiteServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: StaticSiteServiceStackProps) {
    super(scope, id, props);

    const network = this.createNetwork();
    this.configureLoadBalancerIngress(network);
    const alarmTopic = this.createAlarmTopic(props.stage);
    const cluster = this.createCluster(network);
    const logGroup = this.createLogGroup(props.stage);
    const repository = ecr.Repository.fromRepositoryName(
      this,
      "StaticSiteRepository",
      STATIC_SITE_SERVICE_BASE_NAME,
    );
    const taskDefinition = createStaticSiteTaskDefinition({
      scope: this,
      stage: props.stage,
      repository,
      logGroup,
      imageTag: createStaticSiteImageTag({
        stage: props.stage,
        imageVersion: process.env.STATIC_SITE_IMAGE_VERSION,
      }),
    });
    const loadBalancer = this.createLoadBalancer(props.stage, network);
    const targetGroup = this.createTargetGroup(props.stage, network);
    const certificate = this.createCertificate(props.stage);
    const listener = loadBalancer.addListener("StaticSiteListener", {
      port: STATIC_SITE_HTTPS_INGRESS_PORT,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [elbv2.ListenerCertificate.fromCertificateManager(certificate)],
      sslPolicy: elbv2.SslPolicy.RECOMMENDED_TLS,
      open: false,
      defaultTargetGroups: [targetGroup],
    });
    const service = this.createService({
      stage: props.stage,
      cluster,
      taskDefinition,
      network,
    });

    service.attachToApplicationTargetGroup(targetGroup);
    createStaticSiteAlarms({
      scope: this,
      stage: props.stage,
      cluster,
      service,
      targetGroup,
      desiredCount: STATIC_SITE_DESIRED_COUNT,
      alarmTopic,
    });
    createStaticSiteDeploymentFailureRule({
      scope: this,
      stage: props.stage,
      cluster,
      service,
      alarmTopic,
    });
    createStaticSiteOutputs({
      scope: this,
      stage: props.stage,
      loadBalancer,
      targetGroup,
      cluster,
      service,
    });

    applyStandardTags(listener, props.stage);
  }

  private createNetwork(): StaticSiteNetwork {
    const subnetId01 = requireEnvironmentValue({
      name: "SUBNET_ID_01",
      value: process.env.SUBNET_ID_01,
    });
    const subnetId02 = requireEnvironmentValue({
      name: "SUBNET_ID_02",
      value: process.env.SUBNET_ID_02,
    });

    return {
      vpc: ec2.Vpc.fromVpcAttributes(this, "StaticSiteVpc", {
        vpcId: requireEnvironmentValue({ name: "VPC_ID", value: process.env.VPC_ID }),
        availabilityZones: ["us-east-1a", "us-east-1b"],
        privateSubnetIds: [subnetId01, subnetId02],
      }),
      subnets: [
        ec2.Subnet.fromSubnetId(this, "StaticSiteSubnet01", subnetId01),
        ec2.Subnet.fromSubnetId(this, "StaticSiteSubnet02", subnetId02),
      ],
      securityGroup: ec2.SecurityGroup.fromSecurityGroupId(
        this,
        "StaticSiteSecurityGroup",
        requireEnvironmentValue({ name: "SG_ID", value: process.env.SG_ID }),
        { mutable: true },
      ),
    };
  }

  private configureLoadBalancerIngress(network: StaticSiteNetwork): void {
    network.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(STATIC_SITE_HTTP_INGRESS_PORT),
      "Allow HTTP traffic to the static-site load balancer.",
    );
    network.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(STATIC_SITE_HTTPS_INGRESS_PORT),
      "Allow HTTPS traffic to the static-site load balancer.",
    );
  }

  private createCluster(network: StaticSiteNetwork): ecs.ICluster {
    return ecs.Cluster.fromClusterAttributes(this, "StaticSiteCluster", {
      clusterArn: this.formatArn({
        service: "ecs",
        resource: "cluster",
        resourceName: STATIC_SITE_CLUSTER_NAME,
        arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
      }),
      clusterName: STATIC_SITE_CLUSTER_NAME,
      vpc: network.vpc,
    });
  }

  private createAlarmTopic(stage: string): sns.Topic {
    const alarmTopic = new sns.Topic(this, "StaticSiteAlarmTopic", {
      topicName: `${STATIC_SITE_SERVICE_BASE_NAME}-errors-${stage}`,
    });

    new sns.Subscription(this, "StaticSiteAlarmTopicSubscription", {
      topic: alarmTopic,
      protocol: sns.SubscriptionProtocol.HTTPS,
      endpoint: "https://global.sns-api.chatbot.amazonaws.com",
    });

    alarmTopic.applyRemovalPolicy(RemovalPolicy.RETAIN);
    applyStandardTags(alarmTopic, stage);
    return alarmTopic;
  }

  private createCertificate(stage: string): acm.ICertificate {
    return acm.Certificate.fromCertificateArn(
      this,
      "StaticSiteCertificate",
      this.formatArn({
        service: "acm",
        resource: "certificate",
        resourceName: requireStaticSiteCertificateId(stage),
        arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
      }),
    );
  }

  private createLogGroup(stage: string): logs.LogGroup {
    const logGroup = new logs.LogGroup(this, "StaticSiteLogGroup", {
      logGroupName: `/ecs/${STATIC_SITE_SERVICE_BASE_NAME}/${stage}`,
      retention: logs.RetentionDays.SIX_MONTHS,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    applyStandardTags(logGroup, stage);
    return logGroup;
  }

  private createLoadBalancer(
    stage: string,
    network: StaticSiteNetwork,
  ): elbv2.ApplicationLoadBalancer {
    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, "StaticSiteLoadBalancer", {
      loadBalancerName: createStaticSiteAlbName(stage),
      vpc: network.vpc,
      internetFacing: false,
      securityGroup: network.securityGroup,
      vpcSubnets: { subnets: network.subnets },
      deletionProtection: true,
    });

    applyStandardTags(loadBalancer, stage);
    return loadBalancer;
  }

  private createTargetGroup(
    stage: string,
    network: StaticSiteNetwork,
  ): elbv2.ApplicationTargetGroup {
    const targetGroup = new elbv2.ApplicationTargetGroup(this, "StaticSiteTargetGroup", {
      targetGroupName: createStaticSiteTargetGroupName(stage),
      vpc: network.vpc,
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 80,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        enabled: true,
        path: STATIC_SITE_HEALTH_CHECK_PATH,
        healthyHttpCodes: "200",
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        healthyThresholdCount: 3,
        unhealthyThresholdCount: 3,
      },
    });

    applyStandardTags(targetGroup, stage);
    return targetGroup;
  }

  private createService(props: CreateStaticSiteServiceProps): ecs.FargateService {
    const service = new ecs.FargateService(this, "StaticSiteService", {
      serviceName: createStaticSiteServiceName(props.stage),
      cluster: props.cluster,
      taskDefinition: props.taskDefinition,
      desiredCount: STATIC_SITE_DESIRED_COUNT,
      assignPublicIp: false,
      securityGroups: [props.network.securityGroup],
      vpcSubnets: { subnets: props.network.subnets },
      maxHealthyPercent: STATIC_SITE_DEPLOYMENT_MAX_PERCENT,
      minHealthyPercent: STATIC_SITE_DEPLOYMENT_MIN_HEALTHY_PERCENT,
      circuitBreaker: { rollback: true },
    });

    applyStandardTags(service, props.stage);
    return service;
  }
}

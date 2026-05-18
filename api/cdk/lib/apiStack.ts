import {
  API_SERVICE_NAME,
  REMINDER_EMAIL_CONFIG_SET_BASE,
  WELCOME_EMAIL_CONFIG_SET_BASE,
} from "@businessnjgovnavigator/api/src/libs/constants";
import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as elbv2Targets from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import type { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path from "node:path";
import {
  applyStandardTags,
  attachLambdaToResource,
  createLambda,
  createSesConfigSet,
} from "./stackUtils";

/** Lambda function configuration consumed by API Gateway routes. */
export interface LambdaConfig {
  /** Lambda function to attach to API Gateway routes; optional for stage-specific routes. */
  readonly lambda?: IFunction;
}

/** Properties required to create the API Gateway stack. */
export interface ApiStackProps extends StackProps {
  /** Deployment stage used for API names, tags, and stage-specific routing. */
  readonly stage: string;

  /** Shared Lambda IAM role used by API-owned Lambda functions. */
  readonly lambdaRole: iam.Role;

  /** Lambda functions used by API Gateway integrations. */
  readonly lambdas: Record<string, LambdaConfig>;
}

interface RequiredEnvironmentValue {
  /** Environment variable name to validate. */
  readonly name: string;

  /** Environment variable value to validate. */
  readonly value: string | undefined;
}

interface ApiLoadBalancerNetwork {
  /** Imported VPC that contains the internal API load balancer. */
  readonly vpc: ec2.IVpc;

  /** Imported private subnets used by the internal API load balancer. */
  readonly subnets: ec2.ISubnet[];

  /** Existing security group attached to the internal API load balancer. */
  readonly securityGroup: ec2.ISecurityGroup;
}

interface CustomDomainConfig {
  /** Custom domain name assigned to the API Gateway stage. */
  readonly domainName: string;

  /** ACM certificate ARN used by the API Gateway custom domain. */
  readonly certificateArn: string;
}

interface CreateLoadBalancerOutputsProps {
  /** Deployment stage used in exported output names. */
  readonly stage: string;

  /** Internal API load balancer whose DNS name is exported. */
  readonly loadBalancer: elbv2.ApplicationLoadBalancer;

  /** Lambda target group whose ARN is exported. */
  readonly targetGroup: elbv2.ApplicationTargetGroup;

  /** HTTPS listener whose ARN is exported. */
  readonly listener: elbv2.ApplicationListener;
}

/** HTTPS ingress port used by the internal API load balancer. */
const API_LOAD_BALANCER_HTTPS_INGRESS_PORT = 443;

/** Health route that the internal API load balancer forwards through the proxy Lambda. */
const API_LOAD_BALANCER_HEALTH_CHECK_PATH = "/health";

/** Number of seconds the internal API proxy Lambda can spend forwarding one request. */
const API_LOAD_BALANCER_PROXY_TIMEOUT_SECONDS = 30;

const requireEnvironmentValue = (props: RequiredEnvironmentValue): string => {
  if (props.value === undefined || props.value.trim().length === 0) {
    throw new Error(`${props.name} must be set to deploy the API load balancer`);
  }

  return props.value;
};

const createApiLoadBalancerName = (stage: string): string => {
  return `${API_SERVICE_NAME}-${stage}-alb`;
};

const createApiLoadBalancerTargetGroupName = (stage: string): string => {
  return `${API_SERVICE_NAME}-${stage}-tg`;
};

export class ApiStack extends Stack {
  public readonly restApi: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    if (props.stage === "local") {
      this.restApi = new apigateway.RestApi(this, "ApiGatewayRestApi", {
        restApiName: `LocalApi-${props.stage}`,
        description: "Local API for testing purposes",
      });

      applyStandardTags(this.restApi, props.stage);
      // Default 4XX response
      new apigateway.CfnGatewayResponse(this, "GatewayResponseDefault4XX", {
        responseType: "DEFAULT_4XX",
        restApiId: this.restApi.restApiId,
        responseParameters: {
          "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
        },
      });

      // Default 5XX response
      new apigateway.CfnGatewayResponse(this, "GatewayResponseDefault5XX", {
        responseType: "DEFAULT_5XX",
        restApiId: this.restApi.restApiId,
        responseParameters: {
          "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
        },
      });

      this.restApi.root.addMethod(
        "GET",
        new apigateway.MockIntegration({
          integrationResponses: [
            {
              statusCode: "200",
              responseTemplates: {
                "application/json": JSON.stringify({ message: "Local API working" }),
              },
            },
          ],
          passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        }),
        {
          methodResponses: [{ statusCode: "200" }],
        },
      );
      return;
    }
    this.restApi = new apigateway.RestApi(this, `APIGatewayRestApi-${props.stage}`, {
      restApiName: `${API_SERVICE_NAME}-${props.stage}`,
      description: `API Gateway managed by CDK for stage: ${props.stage}`,
      deployOptions: {
        stageName: props.stage,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    this.addGatewayResponses();
    const expressLambda = props.lambdas.express?.lambda;
    const githubLambda = props.lambdas.githubOauth2?.lambda;

    const authorizer = this.createCognitoAuthorizer(props.stage);
    this.setupRootRoutes(expressLambda!, authorizer);
    this.setupApiRoutes(expressLambda!, githubLambda);

    this.configureCustomDomain(props.stage);
    this.configureApiLoadBalancer(props.stage, props.lambdaRole);

    new CfnOutput(this, "ApiGatewayId", {
      value: this.restApi.restApiId,
      exportName: `${API_SERVICE_NAME}-${props.stage}-ApiGatewayId`,
    });

    createSesConfigSet(this, `${WELCOME_EMAIL_CONFIG_SET_BASE}-${props.stage}`);
    createSesConfigSet(this, `${REMINDER_EMAIL_CONFIG_SET_BASE}-${props.stage}`);
  }

  private addGatewayResponses() {
    const responses = [
      { id: "Global4xxCorsResponse", type: "DEFAULT_4XX" },
      { id: "Global5xxCorsResponse", type: "DEFAULT_5XX" },
      { id: "UnauthorizedCorsResponse", type: "UNAUTHORIZED" },
    ];

    for (const { id, type } of responses) {
      new apigateway.CfnGatewayResponse(this, id, {
        restApiId: this.restApi.restApiId,
        responseType: type,
        responseParameters: {
          "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Methods": "'*'",
        },
      });
    }
  }

  private createCognitoAuthorizer(stage: string) {
    const userPoolId = process.env.COGNITO_USER_POOL_ID!;
    const arn = `arn:aws:cognito-idp:${Stack.of(this).region}:${Stack.of(this).account}:userpool/${userPoolId}`;

    const userPool = cognito.UserPool.fromUserPoolArn(this, `UserPool-${stage}`, arn);

    return new apigateway.CognitoUserPoolsAuthorizer(this, `CognitoAuth-${stage}`, {
      cognitoUserPools: [userPool],
    });
  }

  private setupRootRoutes(lambda: IFunction, authorizer: apigateway.CognitoUserPoolsAuthorizer) {
    attachLambdaToResource(this, this.restApi.root, lambda);
    const proxy = this.restApi.root.addResource("{proxy+}");
    attachLambdaToResource(this, proxy, lambda, authorizer);

    this.setupHealthRoutes(lambda);
  }

  private setupHealthRoutes(lambda: IFunction) {
    const health = this.restApi.root.addResource("health");
    attachLambdaToResource(this, health, lambda);
    const proxy = health.addResource("{proxy+}");
    attachLambdaToResource(this, proxy, lambda);
  }

  private setupApiRoutes(expressLambda: IFunction, githubLambda?: IFunction) {
    const api = this.restApi.root.addResource("api");
    attachLambdaToResource(this, api, expressLambda);

    const subRoutes = [
      { name: "external", proxy: true },
      { name: "guest", proxy: true },
      { name: "mgmt", proxy: true },
      { name: "self-reg", proxy: false },
    ];

    for (const { name, proxy } of subRoutes) {
      const route = api.addResource(name);
      attachLambdaToResource(this, route, expressLambda);

      if (proxy) {
        const proxyRoute = route.addResource("{proxy+}");
        attachLambdaToResource(this, proxyRoute, expressLambda);
      }
    }

    if (process.env.FEATURE_USERDATA_ENDPOINT === "true") {
      const userSchema = api.addResource("user-schema");
      attachLambdaToResource(this, userSchema, expressLambda);
    }

    const users = api.addResource("users");
    attachLambdaToResource(this, users, expressLambda);

    const email = users.addResource("emailCheck");
    attachLambdaToResource(this, email, expressLambda);

    if (githubLambda) {
      const cms = api.addResource("cms");
      attachLambdaToResource(this, cms, githubLambda);
      const cmsProxy = cms.addResource("{proxy+}");
      attachLambdaToResource(this, cmsProxy, githubLambda);
    }
  }

  private getCustomDomainConfig(stage: string): CustomDomainConfig {
    const certificateArn = process.env.API_GATEWAY_CERT_ARN;

    if (!certificateArn) {
      throw new Error("Missing required env var: API_GATEWAY_CERT_ARN");
    }

    const domainMap: Record<string, string> = {
      dev: "dev.api.account.business.nj.gov",
      content: "content.api.account.business.nj.gov",
      testing: "testing.api.account.business.nj.gov",
      staging: "staging.api.account.business.nj.gov",
      prod: "api.account.business.nj.gov",
    };

    const domainName = domainMap[stage];
    if (!domainName) {
      throw new Error(`Invalid stage for custom domain: ${stage}`);
    }
    return {
      domainName,
      certificateArn,
    };
  }

  private configureCustomDomain(stage: string) {
    const { domainName, certificateArn } = this.getCustomDomainConfig(stage);

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      `ApiDomainCertificate-${stage}`,
      certificateArn,
    );

    const domain = new apigateway.DomainName(this, `ApiCustomDomain-${stage}-v2`, {
      domainName,
      certificate,
      endpointType: apigateway.EndpointType.EDGE,
      securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
    });

    new apigateway.BasePathMapping(this, `ApiBasePathMapping-${stage}-v2`, {
      domainName: domain,
      restApi: this.restApi,
      stage: this.restApi.deploymentStage,
    });
  }

  private configureApiLoadBalancer(stage: string, lambdaRole: iam.Role): void {
    const network = this.createLoadBalancerNetwork();
    this.configureLoadBalancerIngress(network);
    const loadBalancer = this.createLoadBalancer(stage, network);
    const proxyLambda = this.createLoadBalancerProxyLambda(stage, lambdaRole);
    const targetGroup = this.createLoadBalancerTargetGroup(stage, proxyLambda);
    const certificate = this.createCertificate();
    const listener = loadBalancer.addListener("ApiLoadBalancerListener", {
      port: API_LOAD_BALANCER_HTTPS_INGRESS_PORT,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [elbv2.ListenerCertificate.fromCertificateManager(certificate)],
      sslPolicy: elbv2.SslPolicy.RECOMMENDED_TLS,
      open: false,
      defaultTargetGroups: [targetGroup],
    });

    applyStandardTags(listener, stage);
    this.createLoadBalancerOutputs({ stage, loadBalancer, targetGroup, listener });
  }

  private createLoadBalancerNetwork(): ApiLoadBalancerNetwork {
    const subnetId01 = requireEnvironmentValue({
      name: "SUBNET_ID_01",
      value: process.env.SUBNET_ID_01,
    });
    const subnetId02 = requireEnvironmentValue({
      name: "SUBNET_ID_02",
      value: process.env.SUBNET_ID_02,
    });

    return {
      vpc: ec2.Vpc.fromVpcAttributes(this, "ApiLoadBalancerVpc", {
        vpcId: requireEnvironmentValue({ name: "VPC_ID", value: process.env.VPC_ID }),
        availabilityZones: ["us-east-1a", "us-east-1b"],
        privateSubnetIds: [subnetId01, subnetId02],
      }),
      subnets: [
        ec2.Subnet.fromSubnetId(this, "ApiLoadBalancerSubnet01", subnetId01),
        ec2.Subnet.fromSubnetId(this, "ApiLoadBalancerSubnet02", subnetId02),
      ],
      securityGroup: ec2.SecurityGroup.fromSecurityGroupId(
        this,
        "ApiLoadBalancerSecurityGroup",
        requireEnvironmentValue({ name: "SG_ID", value: process.env.SG_ID }),
        { mutable: true },
      ),
    };
  }

  private configureLoadBalancerIngress(network: ApiLoadBalancerNetwork): void {
    network.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(API_LOAD_BALANCER_HTTPS_INGRESS_PORT),
      "Allow HTTPS traffic to the API load balancer.",
    );
  }

  private createLoadBalancer(
    stage: string,
    network: ApiLoadBalancerNetwork,
  ): elbv2.ApplicationLoadBalancer {
    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, "ApiLoadBalancer", {
      loadBalancerName: createApiLoadBalancerName(stage),
      vpc: network.vpc,
      internetFacing: false,
      securityGroup: network.securityGroup,
      vpcSubnets: { subnets: network.subnets },
      deletionProtection: true,
    });

    applyStandardTags(loadBalancer, stage);
    return loadBalancer;
  }

  private createLoadBalancerProxyLambda(stage: string, lambdaRole: iam.Role): IFunction {
    return createLambda(this, {
      role: lambdaRole,
      id: `${API_SERVICE_NAME}-${stage}-apiGatewayLoadBalancerProxy`,
      stage,
      functionName: `${API_SERVICE_NAME}-${stage}-apiGatewayLoadBalancerProxy`,
      entry: path.join(__dirname, "../../src/functions/apiGatewayLoadBalancerProxy/app.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(API_LOAD_BALANCER_PROXY_TIMEOUT_SECONDS),
      environment: {
        API_GATEWAY_PROXY_BASE_URL: this.restApi.url,
      },
    });
  }

  private createLoadBalancerTargetGroup(
    stage: string,
    proxyLambda: IFunction,
  ): elbv2.ApplicationTargetGroup {
    const targetGroup = new elbv2.ApplicationTargetGroup(this, "ApiLoadBalancerTargetGroup", {
      targetGroupName: createApiLoadBalancerTargetGroupName(stage),
      targetType: elbv2.TargetType.LAMBDA,
      targets: [new elbv2Targets.LambdaTarget(proxyLambda)],
      healthCheck: {
        enabled: true,
        path: API_LOAD_BALANCER_HEALTH_CHECK_PATH,
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        healthyThresholdCount: 3,
        unhealthyThresholdCount: 3,
      },
    });

    applyStandardTags(targetGroup, stage);
    return targetGroup;
  }

  private createCertificate(): acm.ICertificate {
    return acm.Certificate.fromCertificateArn(
      this,
      "ApiLoadBalancerCertificate",
      requireEnvironmentValue({
        name: "API_GATEWAY_CERT_ARN",
        value: process.env.API_GATEWAY_CERT_ARN,
      }),
    );
  }

  private createLoadBalancerOutputs(props: CreateLoadBalancerOutputsProps): void {
    new CfnOutput(this, "ApiLoadBalancerDnsName", {
      value: props.loadBalancer.loadBalancerDnsName,
      exportName: `${API_SERVICE_NAME}-${props.stage}-ApiLoadBalancerDnsName`,
    });
    new CfnOutput(this, "ApiLoadBalancerTargetGroupArn", {
      value: props.targetGroup.targetGroupArn,
      exportName: `${API_SERVICE_NAME}-${props.stage}-ApiLoadBalancerTargetGroupArn`,
    });
    new CfnOutput(this, "ApiLoadBalancerListenerArn", {
      value: props.listener.listenerArn,
      exportName: `${API_SERVICE_NAME}-${props.stage}-ApiLoadBalancerListenerArn`,
    });
  }
}

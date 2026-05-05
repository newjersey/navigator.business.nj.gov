import { CfnOutput } from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";
import { STATIC_SITE_HOSTNAMES, STATIC_SITE_SERVICE_BASE_NAME } from "./constants";

/** Inputs for creating static-site CloudFormation outputs. */
export interface CreateStaticSiteOutputsProps {
  /** Construct scope that owns the CloudFormation outputs. */
  readonly scope: Construct;

  /** Deployment stage used in output names and hostname selection. */
  readonly stage: string;

  /** Internal ALB whose DNS name is exported for Terraform and WAF origin wiring. */
  readonly loadBalancer: elbv2.ApplicationLoadBalancer;

  /** ALB target group whose ARN is exported for operational visibility. */
  readonly targetGroup: elbv2.ApplicationTargetGroup;

  /** ECS cluster whose name is exported for deployment and operational visibility. */
  readonly cluster: ecs.ICluster;

  /** ECS service whose name is exported for deployment and operational visibility. */
  readonly service: ecs.FargateService;
}

/** Create the static-site outputs consumed by DNS, WAF, deployment, and operators. */
export const createStaticSiteOutputs = (props: CreateStaticSiteOutputsProps): void => {
  new CfnOutput(props.scope, "StaticSiteHostname", {
    value: STATIC_SITE_HOSTNAMES[props.stage] ?? `${props.stage}.next.business.nj.gov`,
    exportName: `${STATIC_SITE_SERVICE_BASE_NAME}-${props.stage}-hostname`,
  });
  new CfnOutput(props.scope, "StaticSiteLoadBalancerDnsName", {
    value: props.loadBalancer.loadBalancerDnsName,
    exportName: `${STATIC_SITE_SERVICE_BASE_NAME}-${props.stage}-alb-dns-name`,
  });
  new CfnOutput(props.scope, "StaticSiteTargetGroupArn", {
    value: props.targetGroup.targetGroupArn,
    exportName: `${STATIC_SITE_SERVICE_BASE_NAME}-${props.stage}-target-group-arn`,
  });
  new CfnOutput(props.scope, "StaticSiteClusterName", {
    value: props.cluster.clusterName,
    exportName: `${STATIC_SITE_SERVICE_BASE_NAME}-${props.stage}-cluster-name`,
  });
  new CfnOutput(props.scope, "StaticSiteServiceName", {
    value: props.service.serviceName,
    exportName: `${STATIC_SITE_SERVICE_BASE_NAME}-${props.stage}-service-name`,
  });
};

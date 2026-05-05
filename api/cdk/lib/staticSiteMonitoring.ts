import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudwatchActions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as events from "aws-cdk-lib/aws-events";
import * as eventsTargets from "aws-cdk-lib/aws-events-targets";
import * as sns from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";
import { STATIC_SITE_SERVICE_BASE_NAME } from "./constants";
import { applyStandardTags } from "./stackUtils";

/**
 * CloudWatch alarm evaluation period for the static-site service.
 *
 * Five minutes matches the existing ECS monitoring cadence and avoids noisy alarms from short
 * deployment transitions while still surfacing real service failures promptly.
 */
export const STATIC_SITE_ALARM_PERIOD = Duration.minutes(5);

/** Inputs for creating static-site CloudWatch alarms. */
export interface CreateStaticSiteAlarmsProps {
  /** Construct scope that owns the CloudWatch alarms. */
  readonly scope: Construct;

  /** Deployment stage that appears in alarm names and tags. */
  readonly stage: string;

  /** ECS cluster whose Container Insights metrics report service task counts. */
  readonly cluster: ecs.ICluster;

  /** Fargate service whose running task count is monitored. */
  readonly service: ecs.FargateService;

  /** ALB target group whose health and 5xx metrics are monitored. */
  readonly targetGroup: elbv2.ApplicationTargetGroup;

  /** Desired running task count used as the lower bound alarm threshold. */
  readonly desiredCount: number;

  /** SNS topic that receives alarm and OK notifications. */
  readonly alarmTopic: sns.ITopic;
}

/** Inputs for creating the static-site ECS deployment failure notification rule. */
export interface CreateStaticSiteDeploymentFailureRuleProps {
  /** Construct scope that owns the EventBridge rule. */
  readonly scope: Construct;

  /** Deployment stage that appears in the rule name and tags. */
  readonly stage: string;

  /** ECS cluster whose deployment state change events are matched. */
  readonly cluster: ecs.ICluster;

  /** Fargate service whose deployment failures are matched. */
  readonly service: ecs.FargateService;

  /** SNS topic that receives deployment failure notifications. */
  readonly alarmTopic: sns.ITopic;
}

/** Create CloudWatch alarms for target health, target 5xx responses, and running task count. */
export const createStaticSiteAlarms = (props: CreateStaticSiteAlarmsProps): void => {
  const unhealthyTargetAlarm = new cloudwatch.Alarm(props.scope, "StaticSiteUnhealthyTargetAlarm", {
    alarmName: `${props.stage}-${STATIC_SITE_SERVICE_BASE_NAME}-unhealthy-targets`,
    metric: props.targetGroup.metrics.unhealthyHostCount({
      period: STATIC_SITE_ALARM_PERIOD,
      statistic: "Average",
    }),
    threshold: 1,
    evaluationPeriods: 1,
    datapointsToAlarm: 1,
    comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
  });
  const targetFiveHundredAlarm = new cloudwatch.Alarm(props.scope, "StaticSiteTarget5xxAlarm", {
    alarmName: `${props.stage}-${STATIC_SITE_SERVICE_BASE_NAME}-target-5xx`,
    metric: props.targetGroup.metrics.httpCodeTarget(elbv2.HttpCodeTarget.TARGET_5XX_COUNT, {
      period: STATIC_SITE_ALARM_PERIOD,
      statistic: "Sum",
    }),
    threshold: 1,
    evaluationPeriods: 1,
    datapointsToAlarm: 1,
    comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
  });
  const runningTaskCountAlarm = new cloudwatch.Alarm(
    props.scope,
    "StaticSiteRunningTaskCountAlarm",
    {
      alarmName: `${props.stage}-${STATIC_SITE_SERVICE_BASE_NAME}-running-task-count`,
      metric: new cloudwatch.Metric({
        namespace: "ECS/ContainerInsights",
        metricName: "RunningTaskCount",
        statistic: "Average",
        period: STATIC_SITE_ALARM_PERIOD,
        dimensionsMap: {
          ClusterName: props.cluster.clusterName,
          ServiceName: props.service.serviceName,
        },
      }),
      threshold: props.desiredCount,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    },
  );

  for (const alarm of [unhealthyTargetAlarm, targetFiveHundredAlarm, runningTaskCountAlarm]) {
    alarm.addAlarmAction(new cloudwatchActions.SnsAction(props.alarmTopic));
    alarm.addOkAction(new cloudwatchActions.SnsAction(props.alarmTopic));
    alarm.applyRemovalPolicy(RemovalPolicy.RETAIN);
  }
};

/** Create an EventBridge rule that publishes ECS deployment failures to the alarm topic. */
export const createStaticSiteDeploymentFailureRule = (
  props: CreateStaticSiteDeploymentFailureRuleProps,
): void => {
  const rule = new events.Rule(props.scope, "StaticSiteDeploymentFailureRule", {
    ruleName: `${props.stage}-${STATIC_SITE_SERVICE_BASE_NAME}-deployment-failures`,
    eventPattern: {
      source: ["aws.ecs"],
      detailType: ["ECS Deployment State Change"],
      detail: {
        eventName: ["SERVICE_DEPLOYMENT_FAILED"],
        clusterArn: [props.cluster.clusterArn],
        serviceArn: [props.service.serviceArn],
      },
    },
  });

  rule.addTarget(new eventsTargets.SnsTopic(props.alarmTopic));
  applyStandardTags(rule, props.stage);
};

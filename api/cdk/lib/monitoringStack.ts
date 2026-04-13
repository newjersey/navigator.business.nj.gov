import { RemovalPolicy, Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudwatch_actions from "aws-cdk-lib/aws-cloudwatch-actions";
import {
  HEALTH_CHECK_SERVICE,
  NAVIGATOR_DB_CLIENT,
  NAVIGATOR_WEBSERVICE,
  HEALTH_CHECK_ENDPOINTS,
} from "./constants";

export interface MonitoringStackProps extends StackProps {
  stage: string;
}

export class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    const apiLogGroup = new logs.LogGroup(this, "ApiLogGroup", {
      logGroupName: `/${NAVIGATOR_WEBSERVICE}/${props.stage}/ApiLogs`,
      retention: logs.RetentionDays.SIX_MONTHS,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    new logs.LogGroup(this, "HealthCheckApiLogGroup", {
      logGroupName: `/${HEALTH_CHECK_SERVICE}/${props.stage}/ApiLogs`,
      retention: logs.RetentionDays.SIX_MONTHS,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const dataMigrationLogGroup = new logs.LogGroup(this, "DataMigrationLogGroup", {
      logGroupName: `/${NAVIGATOR_DB_CLIENT}/${props.stage}/DataMigrationLogs`,
      retention: logs.RetentionDays.SIX_MONTHS,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    if (props.stage === "dev") {
      new logs.LogGroup(this, "ApiLogLocalGroup", {
        logGroupName: `/${NAVIGATOR_WEBSERVICE}/local/ApiLogs`,
        retention: logs.RetentionDays.SIX_MONTHS,
        removalPolicy: RemovalPolicy.RETAIN,
      });

      new logs.LogGroup(this, "DataMigrationLogLocalGroup", {
        logGroupName: `/${NAVIGATOR_DB_CLIENT}/local/DataMigrationLogs`,
        retention: logs.RetentionDays.SIX_MONTHS,
        removalPolicy: RemovalPolicy.RETAIN,
      });
    }

    const apiErrorMetricFilter = new logs.MetricFilter(this, "ApiErrorMetricFilter", {
      logGroup: apiLogGroup,
      filterName: `ApiErrorCount-${props.stage}`,
      metricNamespace: "BFS/Navigator",
      metricName: `ApiErrorCount`,
      filterPattern: logs.FilterPattern.literal("error"),
      metricValue: "1",
      defaultValue: 0,
    });

    const nicUsaApiErrorMetricFilter = new logs.MetricFilter(this, "NicUsaApiErrorMetricFilter", {
      logGroup: apiLogGroup,
      filterName: `NicUsaApiErrorCount-${props.stage}`,
      metricNamespace: "BFS/Navigator",
      metricName: `NicUsaApiErrorCount`,
      filterPattern: logs.FilterPattern.literal("error NICUSA"),
      metricValue: "1",
      defaultValue: 0,
    });

    const dataMigrationMetricFilter = new logs.MetricFilter(
      this,
      "DataMigrationErrorMetricFilter",
      {
        logGroup: dataMigrationLogGroup,
        filterName: `dataMigrationErrorCount-${props.stage}`,
        filterPattern: logs.FilterPattern.literal("Dynamo User Migration Error"),
        metricNamespace: "BFS/Navigator",
        metricName: `dataMigrationErrorCount`,
        metricValue: "1",
        defaultValue: 0,
      },
    );

    const shouldCreateMonitoringResources = props.stage !== "content" && props.stage !== "testing";

    if (shouldCreateMonitoringResources) {
      const dataMigrationTopic = new sns.Topic(this, "DataMigrationErrorTopic", {
        topicName: `bfs-navigator-${props.stage}-data-migration-errors`,
      });

      new sns.Subscription(this, "DataMigrationSubscription", {
        topic: dataMigrationTopic,
        protocol: sns.SubscriptionProtocol.HTTPS,
        endpoint: "https://global.sns-api.chatbot.amazonaws.com",
      });

      const dataMigrationMetric = dataMigrationMetricFilter.metric({
        statistic: "Sum",
        period: Duration.seconds(120),
      });

      const dataMigrationAlarm = new cloudwatch.Alarm(this, "DataMigrationErrorAlarm", {
        alarmName: `${props.stage}-bfs-navigator-data-migration-errors`,
        metric: dataMigrationMetric,
        threshold: 1,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      dataMigrationAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(dataMigrationTopic));

      const navigatorApiErrorTopic = new sns.Topic(this, "NavigatorApiErrorTopic", {
        topicName: `bfs-navigator-errors-${props.stage}`,
      });

      new sns.Subscription(this, "navigatorApiErrorTopicSubscription", {
        topic: navigatorApiErrorTopic,
        protocol: sns.SubscriptionProtocol.HTTPS,
        endpoint: "https://global.sns-api.chatbot.amazonaws.com",
      });

      const nicUsaApiErrorMetric = nicUsaApiErrorMetricFilter.metric({
        statistic: "Sum",
        period: Duration.seconds(60),
      });

      const myAccountNicUsaErrorAlarm = new cloudwatch.Alarm(this, "MyAccountNicUsaErrorAlarm", {
        alarmName: `${props.stage}-bfs-navigator-nicusa-errors`,
        metric: nicUsaApiErrorMetric,
        threshold: 1,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      myAccountNicUsaErrorAlarm.addAlarmAction(
        new cloudwatch_actions.SnsAction(navigatorApiErrorTopic),
      );

      const apiErrorMetric = apiErrorMetricFilter.metric({
        statistic: "Sum",
        period: Duration.seconds(60),
      });

      const apiErrorAlarm = new cloudwatch.Alarm(this, "ApiErrorAlarm", {
        alarmName: `${props.stage}-bfs-navigator-errors`,
        metric: apiErrorMetric,
        threshold: 1,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      apiErrorAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));

      const healthCheckErrorTopic = new sns.Topic(this, "HealthCheckErrorTopic", {
        topicName: `bfs-navigator-${props.stage}-health-check-errors`,
      });

      new sns.Subscription(this, "healthCheckErrorTopicSubscription", {
        topic: healthCheckErrorTopic,
        protocol: sns.SubscriptionProtocol.HTTPS,
        endpoint: "https://global.sns-api.chatbot.amazonaws.com",
      });

      for (const [key, endpoint] of Object.entries(HEALTH_CHECK_ENDPOINTS)) {
        const metric = new cloudwatch.Metric({
          namespace: "BFS/Navigator",
          metricName: "HealthCheckError",
          statistic: "Sum",
          period: Duration.seconds(300),
          dimensionsMap: {
            Stage: props.stage,
            Endpoint: endpoint,
          },
        });

        const alarm = new cloudwatch.Alarm(this, `HealthCheckAlarm-${key}`, {
          alarmName: `${props.stage}-bfs-navigator-healthcheck-${key}-alarm`,
          metric,
          threshold: 1,
          evaluationPeriods: 2,
          datapointsToAlarm: 2,
          comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });

        alarm.addAlarmAction(new cloudwatch_actions.SnsAction(healthCheckErrorTopic));

        alarm.addOkAction(new cloudwatch_actions.SnsAction(healthCheckErrorTopic));
      }
    }
  }
}

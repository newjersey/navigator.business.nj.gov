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
  USERS_TABLE,
  BUSINESSES_TABLE,
  ECS_SERVICE_NAME,
  ECS_CLUSTER_NAME,
} from "./constants";

export interface MonitoringStackProps extends StackProps {
  stage: string;
}

export class MonitoringStack extends Stack {
  public readonly migrationLambdaTopic: sns.Topic;

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

    const expressLogGroup = logs.LogGroup.fromLogGroupName(
      this,
      "ExpressRegLogGroup",
      `/aws/lambda/businessnjgov-api-v2-${props.stage}-express`,
    );

    const migrateUsersVersionLogGroup = logs.LogGroup.fromLogGroupName(
      this,
      "MigrateUsersVersionLogGroup",
      `/aws/lambda/businessnjgov-api-v2-${props.stage}-migrateUsersVersion`,
    );

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

      const cmsAlertTopic = new sns.Topic(this, "CmsAlertTopic", {
        topicName: `bfs-navigator-${props.stage}-cms-alert-topic`,
      });

      cmsAlertTopic.applyRemovalPolicy(RemovalPolicy.RETAIN);

      new sns.Subscription(this, "CmsAlertTopicSubscription", {
        topic: cmsAlertTopic,
        protocol: sns.SubscriptionProtocol.HTTPS,
        endpoint: "https://global.sns-api.chatbot.amazonaws.com",
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

    const migrationFailureMetricFilter = new logs.MetricFilter(
      this,
      "MigrationFailureMetricFilter",
      {
        logGroup: migrateUsersVersionLogGroup,
        filterName: `MigrationFailureCount-${props.stage}`,
        metricNamespace: "BFS/Navigator/Lambda",
        metricName: "MigrateUserVersionsFailures",
        filterPattern: logs.FilterPattern.literal('"MigrateUserVersions Failed"'),
        metricValue: "1",
        defaultValue: 0,
      },
    );

    const migrationFailureMetric = migrationFailureMetricFilter.metric({
      statistic: "Sum",
      period: Duration.seconds(300),
    });

    this.migrationLambdaTopic = new sns.Topic(this, "migrationLambdaTopic", {
      topicName: `bfs-navigator-${props.stage}-migrationLambda-Topic`,
    });
    this.migrationLambdaTopic.applyRemovalPolicy(RemovalPolicy.RETAIN);

    const killSwitchAlertsTopic = new sns.Topic(this, "KillSwitchAlertsTopic", {
      topicName: `bfs-navigator-${props.stage}-kill-switch-alerts`,
    });
    killSwitchAlertsTopic.applyRemovalPolicy(RemovalPolicy.RETAIN);

    new sns.Subscription(this, "KillSwitchAlertsSubscription", {
      topic: killSwitchAlertsTopic,
      protocol: sns.SubscriptionProtocol.HTTPS,
      endpoint: "https://global.sns-api.chatbot.amazonaws.com",
    });

    const migrateUserVersionErrorTopic = new sns.Topic(this, "MigrateUserVersionErrorTopic", {
      topicName: `bfs-navigator-${props.stage}-migrate-user-version-errors`,
    });
    migrateUserVersionErrorTopic.applyRemovalPolicy(RemovalPolicy.RETAIN);

    new sns.Subscription(this, "MigrateUserVersionErrorSubscription", {
      topic: migrateUserVersionErrorTopic,
      protocol: sns.SubscriptionProtocol.HTTPS,
      endpoint: "https://global.sns-api.chatbot.amazonaws.com",
    });

    const migrationFailureAlarm = new cloudwatch.Alarm(this, "MigrationFailureAlarm", {
      alarmName: `bfs-migrate-userVersions-failures-${props.stage}`,
      metric: migrationFailureMetric,
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: `Alarm when the MigrateUserVersions failure count exceeds the threshold for ${props.stage}`,
    });

    migrationFailureAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(migrateUserVersionErrorTopic),
    );
    migrationFailureAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

    const killSwitchAlarm = new cloudwatch.Alarm(this, "KillSwitchSNSAlarm", {
      alarmName: `KillSwitchSNSActivity-${props.stage}`,
      metric: new cloudwatch.Metric({
        namespace: "AWS/SNS",
        metricName: "NumberOfMessagesPublished",
        statistic: "Sum",
        period: Duration.seconds(60),
        dimensionsMap: {
          TopicName: this.migrationLambdaTopic.topicName,
        },
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: "Alarms when kill switch SNS topic is triggered for visibility.",
    });

    killSwitchAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(killSwitchAlertsTopic));

    killSwitchAlarm.addOkAction(new cloudwatch_actions.SnsAction(killSwitchAlertsTopic));

    killSwitchAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

    const shouldCreateMonitoringResources = props.stage !== "content" && props.stage !== "testing";

    if (shouldCreateMonitoringResources) {
      const selfRegErrorMetricFilter = new logs.MetricFilter(this, "SelfRegErrorMetricFilter", {
        logGroup: expressLogGroup,
        filterName: `myNJSelfRegErrorCount-${props.stage}`,
        metricNamespace: "BFS/Navigator",
        metricName: "myNJSelfRegErrorCount",
        filterPattern: logs.FilterPattern.literal('"myNJSelfRegError"'),
        metricValue: "1",
        defaultValue: 0,
      });
      const selfRegMetric = selfRegErrorMetricFilter.metric({
        statistic: "Sum",
        period: Duration.seconds(300),
      });

      const mynjSelfRegTopic = new sns.Topic(this, "MynjSelfRegTopic", {
        topicName: `bfs-navigator-${props.stage}-mynj-selfreg-errors`,
      });

      new sns.Subscription(this, "MynjSelfRegTopicSubscription", {
        topic: mynjSelfRegTopic,
        protocol: sns.SubscriptionProtocol.HTTPS,
        endpoint: "https://global.sns-api.chatbot.amazonaws.com",
      });

      mynjSelfRegTopic.applyRemovalPolicy(RemovalPolicy.RETAIN);

      const selfRegAlarm = new cloudwatch.Alarm(this, "MyNjLoginErrorsAlarm", {
        alarmName: `myNJSelfRegLoginErrors-${props.stage}`,
        metric: selfRegMetric,
        threshold: 5,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        alarmDescription:
          "Triggered when myNJ login failures exceed threshold, indicating potential login issues.",
      });

      selfRegAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(mynjSelfRegTopic));
      selfRegAlarm.addOkAction(new cloudwatch_actions.SnsAction(mynjSelfRegTopic));

      selfRegAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

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
      dataMigrationTopic.applyRemovalPolicy(RemovalPolicy.RETAIN);

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
      dataMigrationAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

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
      navigatorApiErrorTopic.applyRemovalPolicy(RemovalPolicy.RETAIN);

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
      myAccountNicUsaErrorAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

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
      apiErrorAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

      const dynamoDbUsersLatencyMetric = new cloudwatch.Metric({
        namespace: "AWS/DynamoDB",
        metricName: "SuccessfulRequestLatency",
        statistic: "Average",
        period: Duration.seconds(300),
        dimensionsMap: {
          Operation: "Query",
          TableName: `${USERS_TABLE}-${props.stage}`,
        },
      });

      const dynamoDbLatencyAlarm = new cloudwatch.Alarm(this, "DynamoDbLatencyAlarm", {
        alarmName: `${props.stage}-dynamodb-users-latency`,
        metric: dynamoDbUsersLatencyMetric,
        threshold: 30,
        evaluationPeriods: 2,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
      dynamoDbLatencyAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      dynamoDbLatencyAlarm.addOkAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      dynamoDbLatencyAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

      const dynamoDbBusinessesLatencyMetric = new cloudwatch.Metric({
        namespace: "AWS/DynamoDB",
        metricName: "SuccessfulRequestLatency",
        statistic: "Average",
        period: Duration.seconds(300),
        dimensionsMap: {
          Operation: "Query",
          TableName: `${BUSINESSES_TABLE}-${props.stage}`,
        },
      });

      const dynamoDbBusinessesLatencyAlarm = new cloudwatch.Alarm(
        this,
        "DynamoDbBusinessesLatencyAlarm",
        {
          alarmName: `${props.stage}-dynamodb-businesses-latency`,
          metric: dynamoDbBusinessesLatencyMetric,
          threshold: 30,
          evaluationPeriods: 2,
          comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        },
      );

      dynamoDbBusinessesLatencyAlarm.addAlarmAction(
        new cloudwatch_actions.SnsAction(navigatorApiErrorTopic),
      );
      dynamoDbBusinessesLatencyAlarm.addOkAction(
        new cloudwatch_actions.SnsAction(navigatorApiErrorTopic),
      );
      dynamoDbBusinessesLatencyAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

      const ecsTaskCountMetric = new cloudwatch.Metric({
        namespace: "ECS/ContainerInsights",
        metricName: "DesiredTaskCount",
        statistic: "Average",
        period: Duration.seconds(300),
        dimensionsMap: {
          ServiceName: ECS_SERVICE_NAME,
          ClusterName: ECS_CLUSTER_NAME,
        },
      });

      const ecsTaskCountAlarm = new cloudwatch.Alarm(this, "EcsTaskCountAlarm", {
        alarmName: `${props.stage}-ecs-bfs-navigator-task-count`,
        metric: ecsTaskCountMetric,
        threshold: 2,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      ecsTaskCountAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      ecsTaskCountAlarm.addOkAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      ecsTaskCountAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

      const ecsCpuMetric = new cloudwatch.Metric({
        namespace: "AWS/ECS",
        metricName: "CPUUtilization",
        statistic: "Average",
        period: Duration.seconds(300),
        dimensionsMap: {
          ServiceName: ECS_SERVICE_NAME,
          ClusterName: ECS_CLUSTER_NAME,
        },
      });

      const ecsCpuAlarm = new cloudwatch.Alarm(this, "EcsCpuAlarm", {
        alarmName: `${props.stage}-ecs-bfs-navigator-cpu`,
        metric: ecsCpuMetric,
        threshold: 80,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      ecsCpuAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      ecsCpuAlarm.addOkAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      ecsCpuAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

      const ecsMemoryMetric = new cloudwatch.Metric({
        namespace: "AWS/ECS",
        metricName: "MemoryUtilization",
        statistic: "Average",
        period: Duration.seconds(300),
        dimensionsMap: {
          ServiceName: ECS_SERVICE_NAME,
          ClusterName: ECS_CLUSTER_NAME,
        },
      });

      const ecsMemoryAlarm = new cloudwatch.Alarm(this, "EcsMemoryAlarm", {
        alarmName: `${props.stage}-ecs-bfs-navigator-memory`,
        metric: ecsMemoryMetric,
        threshold: 80,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      ecsMemoryAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      ecsMemoryAlarm.addOkAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      ecsMemoryAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

      const backupMetric = new cloudwatch.Metric({
        namespace: "AWS/Backup",
        metricName: "NumberOfBackupJobsCompleted",
        statistic: "Sum",
        period: Duration.hours(7),
        dimensionsMap: {
          BackupVaultName: "BizX_dynamodb_backups",
        },
      });

      const backupAlarm = new cloudwatch.Alarm(this, "BackupJobAlarm", {
        alarmName: `${props.stage}-backup-job-error`,
        metric: backupMetric,
        threshold: 2,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      backupAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      backupAlarm.addOkAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      backupAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

      const lambdaAnomalyAlarm = new cloudwatch.CfnAlarm(this, "LambdaAnomalyAlarm", {
        alarmName: `${props.stage}-bfs-navigator-lambda-excessive-executions`,
        comparisonOperator: "GreaterThanUpperThreshold",
        evaluationPeriods: 1,
        thresholdMetricId: "ad1",
        treatMissingData: "notBreaching",

        metrics: [
          {
            id: "m1",
            metricStat: {
              metric: {
                namespace: "AWS/Lambda",
                metricName: "Invocations",
                dimensions: [
                  {
                    name: "FunctionName",
                    value: `businessnjgov-api-v2-${props.stage}-express`,
                  },
                ],
              },
              period: 300,
              stat: "Sum",
            },
            returnData: true,
          },
          {
            id: "ad1",
            expression: "ANOMALY_DETECTION_BAND(m1, 2)",
            label: "Expected Invocations",
            returnData: true,
          },
        ],
        alarmActions: [navigatorApiErrorTopic.topicArn],
        okActions: [navigatorApiErrorTopic.topicArn],
      });

      lambdaAnomalyAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

      const lambdaErrorMetricFilter = new logs.MetricFilter(this, "LambdaErrorMetricFilter", {
        logGroup: expressLogGroup,
        filterName: `LambdaErrorCount-${props.stage}`,
        metricNamespace: "BFS/Navigator/Lambda",
        metricName: "LambdaErrorCount",
        filterPattern: logs.FilterPattern.literal("error"),
        metricValue: "1",
        defaultValue: 0,
      });

      const lambdaErrorMetric = lambdaErrorMetricFilter.metric({
        statistic: "Sum",
        period: Duration.seconds(60),
      });

      const lambdaErrorAlarm = new cloudwatch.Alarm(this, "LambdaErrorAlarm", {
        alarmName: `${props.stage}-bfs-navigator-lambda-errors`,
        metric: lambdaErrorMetric,
        threshold: 10,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      lambdaErrorAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      lambdaErrorAlarm.addOkAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      lambdaErrorAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

      const lambdaDurationMetric = new cloudwatch.Metric({
        namespace: "AWS/Lambda",
        metricName: "Duration",
        statistic: "Average",
        period: Duration.seconds(180),
        dimensionsMap: {
          FunctionName: `businessnjgov-api-v2-${props.stage}-express`,
        },
      });

      const lambdaDurationAlarm = new cloudwatch.Alarm(this, "LambdaDurationAlarm", {
        alarmName: `${props.stage}-bfs-navigator-lambda-long-requests`,
        metric: lambdaDurationMetric,
        threshold: 2000,
        evaluationPeriods: 2,
        datapointsToAlarm: 2,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      lambdaDurationAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      lambdaDurationAlarm.addOkAction(new cloudwatch_actions.SnsAction(navigatorApiErrorTopic));
      lambdaDurationAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);

      const healthCheckErrorTopic = new sns.Topic(this, "HealthCheckErrorTopic", {
        topicName: `bfs-navigator-${props.stage}-health-check-errors`,
      });
      healthCheckErrorTopic.applyRemovalPolicy(RemovalPolicy.RETAIN);

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

        const healthCheckAlarm = new cloudwatch.Alarm(this, `HealthCheckAlarm-${key}`, {
          alarmName: `${props.stage}-bfs-navigator-healthcheck-${key}-alarm`,
          metric,
          threshold: 1,
          evaluationPeriods: 2,
          datapointsToAlarm: 2,
          comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });

        healthCheckAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(healthCheckErrorTopic));
        healthCheckAlarm.addOkAction(new cloudwatch_actions.SnsAction(healthCheckErrorTopic));
        healthCheckAlarm.applyRemovalPolicy(RemovalPolicy.RETAIN);
      }
    }
  }
}

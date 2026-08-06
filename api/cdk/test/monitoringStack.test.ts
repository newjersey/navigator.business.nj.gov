import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { MonitoringStack } from "../lib/monitoringStack";

describe("MonitoringStack migration alarm", () => {
  it("uses native Lambda errors and notifies operators and the kill switch", () => {
    const app = new App();
    const stack = new MonitoringStack(app, "TestMonitoringStack", { stage: "local" });
    const alarms = Template.fromStack(stack).findResources("AWS::CloudWatch::Alarm", {
      Properties: {
        AlarmName: "bfs-migrate-userVersions-failures-local",
      },
    });
    const alarm = Object.values(alarms)[0].Properties;

    expect(alarm).toMatchObject({
      Namespace: "AWS/Lambda",
      MetricName: "Errors",
      Statistic: "Sum",
      Threshold: 1,
      EvaluationPeriods: 1,
      ComparisonOperator: "GreaterThanOrEqualToThreshold",
      Dimensions: [
        {
          Name: "FunctionName",
          Value: "businessnjgov-api-v2-local-migrateUsersVersion",
        },
      ],
    });
    expect(alarm.AlarmActions).toEqual(
      expect.arrayContaining([
        {
          Ref: expect.stringContaining("MigrateUserVersionErrorTopic"),
        },
        {
          Ref: expect.stringContaining("migrationLambdaTopic"),
        },
      ]),
    );
  });

  it("alerts operators without activating the kill switch when a user is quarantined", () => {
    const app = new App();
    const stack = new MonitoringStack(app, "TestMonitoringStack", { stage: "local" });
    const template = Template.fromStack(stack);
    const metricFilters = template.findResources("AWS::Logs::MetricFilter", {
      Properties: {
        FilterName: "quarantinedMigrationCount-local",
        LogGroupName: "/aws/lambda/businessnjgov-api-v2-local-migrateUsersVersion",
      },
    });
    const metricFilter = Object.values(metricFilters)[0].Properties;
    const alarms = template.findResources("AWS::CloudWatch::Alarm", {
      Properties: {
        AlarmName: "local-bfs-navigator-quarantined-migration-users",
      },
    });
    const alarm = Object.values(alarms)[0].Properties;

    expect(metricFilter).toMatchObject({
      FilterPattern: '"Quarantined scheduled migration"',
      MetricTransformations: [
        {
          DefaultValue: 0,
          MetricName: "quarantinedMigrationCount-local",
          MetricNamespace: "BFS/Navigator",
          MetricValue: "1",
        },
      ],
    });
    expect(alarm).toMatchObject({
      Namespace: "BFS/Navigator",
      MetricName: "quarantinedMigrationCount-local",
      Statistic: "Sum",
      Period: 120,
      Threshold: 1,
      EvaluationPeriods: 1,
      DatapointsToAlarm: 1,
      ComparisonOperator: "GreaterThanOrEqualToThreshold",
      TreatMissingData: "notBreaching",
    });
    expect(alarm.AlarmActions).toEqual([
      {
        Ref: expect.stringContaining("MigrateUserVersionErrorTopic"),
      },
    ]);
  });
});

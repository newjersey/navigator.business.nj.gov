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
});

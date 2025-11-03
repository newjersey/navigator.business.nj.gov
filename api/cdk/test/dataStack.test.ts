import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { DataStack, DataStackProps } from "../lib/dataStack";

describe("DataStack", () => {
  let app: App;

  const defaultProps: DataStackProps = {
    stage: "local",
  };

  beforeEach(() => {
    app = new App();
  });

  test("creates Users, Businesses, and Messages tables in local stage", () => {
    expect(() => {
      const stack = new DataStack(app, "TestDataStackLocal", defaultProps);
      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        TableName: "users-table-local",
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: Match.arrayWith([{ AttributeName: "userId", KeyType: "HASH" }]),
        AttributeDefinitions: Match.arrayWith([
          { AttributeName: "userId", AttributeType: "S" },
          { AttributeName: "email", AttributeType: "S" },
        ]),
        Tags: Match.arrayWith([{ Key: "STAGE", Value: "local" }]),
      });

      template.hasResourceProperties("AWS::DynamoDB::Table", {
        TableName: "businesses-table-local",
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: Match.arrayWith([{ AttributeName: "businessId", KeyType: "HASH" }]),
        AttributeDefinitions: Match.arrayWith([
          { AttributeName: "businessId", AttributeType: "S" },
          { AttributeName: "businessName", AttributeType: "S" },
          { AttributeName: "naicsCode", AttributeType: "S" },
          { AttributeName: "industry", AttributeType: "S" },
          { AttributeName: "hashedTaxId", AttributeType: "S" },
          { AttributeName: "businessNamePartition", AttributeType: "S" },
        ]),
        Tags: Match.arrayWith([{ Key: "STAGE", Value: "local" }]),
      });

      template.hasResourceProperties("AWS::DynamoDB::Table", {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: "BusinessName",
            KeySchema: Match.arrayWith([{ AttributeName: "businessName", KeyType: "HASH" }]),
          }),
        ]),
      });
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: "BusinessName",
            KeySchema: Match.arrayWith([{ AttributeName: "businessName", KeyType: "HASH" }]),
          }),
        ]),
      });
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: "NaicsCode",
            KeySchema: Match.arrayWith([{ AttributeName: "naicsCode", KeyType: "HASH" }]),
          }),
        ]),
      });
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: "BusinessNameWithSortKey",
            KeySchema: Match.arrayWith([
              { AttributeName: "businessNamePartition", KeyType: "HASH" },
            ]),
          }),
        ]),
      });
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: "HashedTaxId",
            KeySchema: Match.arrayWith([{ AttributeName: "hashedTaxId", KeyType: "HASH" }]),
          }),
        ]),
      });
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: "Industry",
            KeySchema: Match.arrayWith([{ AttributeName: "industry", KeyType: "HASH" }]),
          }),
        ]),
      });

      template.hasResourceProperties("AWS::DynamoDB::Table", {
        TableName: "messages-table-local",
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: Match.arrayWith([{ AttributeName: "taskId", KeyType: "HASH" }]),
        AttributeDefinitions: Match.arrayWith([
          { AttributeName: "taskId", AttributeType: "S" },
          { AttributeName: "dueAt", AttributeType: "S" },
        ]),
        Tags: Match.arrayWith([{ Key: "STAGE", Value: "local" }]),
      });
    }).not.toThrow();
  });

  test("validates that tables not created in Terraform are created in CDK", () => {
    expect(() => {
      process.env.CI = "true";
      const stack = new DataStack(app, "TestDataStackDev", {
        stage: "dev",
      });
      const template = Template.fromStack(stack);

      template.resourceCountIs("AWS::DynamoDB::Table", 1);
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        TableName: "messages-table-dev",
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: Match.arrayWith([{ AttributeName: "taskId", KeyType: "HASH" }]),
        AttributeDefinitions: Match.arrayWith([
          { AttributeName: "taskId", AttributeType: "S" },
          { AttributeName: "dueAt", AttributeType: "S" },
        ]),
        Tags: Match.arrayWith([{ Key: "STAGE", Value: "dev" }]),
      });
    }).not.toThrow();
  });
});

import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { ApiStack } from "../lib/apiStack";

describe("ApiStack", () => {
  let app: App;
  let testStack: Stack;
  let stack: ApiStack;
  let mockLambda: lambda.Function;

  beforeEach(() => {
    app = new App();
    testStack = new Stack(app, "TestStack");
    mockLambda = new lambda.Function(testStack, "MockLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromInline("exports.handler = () => {};"),
    });

    stack = new ApiStack(app, "ApiStackLocal", {
      stage: "local",
      githubOauth2Lambda: mockLambda,
    });

    // delete process.env.CI;
    // delete process.env.API_GATEWAY_ID;
    // delete process.env.API_GATEWAY_ROOT_RESOURCE_ID;
  });

  test("creates a local RestApi with default responses", () => {
    expect(() => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::ApiGateway::RestApi", {
        Name: "LocalApi-local",
      });

      template.resourceCountIs("AWS::ApiGateway::GatewayResponse", 2);
    }).not.toThrow();
  });

  test("imports existing RestApi when env vars are set in non-local stage", () => {
    process.env.CI = "true";
    process.env.API_GATEWAY_ID = "fake-api-id";
    process.env.API_GATEWAY_ROOT_RESOURCE_ID = "fake-root-id";

    expect(() => {
      const importedStack = new ApiStack(app, "ApiStackImported", {
        stage: "dev",
        githubOauth2Lambda: mockLambda,
      });

      const template = Template.fromStack(importedStack);
      template.resourceCountIs("AWS::ApiGateway::RestApi", 0);
      template.resourceCountIs("AWS::ApiGateway::GatewayResponse", 0);
    }).not.toThrow();
  });
});

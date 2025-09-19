import { App } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
// eslint-disable-next-line no-restricted-imports
import { LambdaStack, LambdaStackProps } from "../lib/lambdaStack";

describe("LambdaStack", () => {
  let app: App;
  let stack: LambdaStack;
  let template: Template;

  const defaultProps: LambdaStackProps = {
    stage: "local",
  };

  beforeEach(() => {
    app = new App();
    stack = new LambdaStack(app, "TestLambdaStack", defaultProps);
    template = Template.fromStack(stack);
  });

  it("creates the express Lambda with correct environment variables", () => {
    expect(() => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: Match.stringLikeRegexp("businessnjgov-api-local-express"),
        Runtime: "nodejs20.x",
        Environment: {
          Variables: Match.objectLike({
            ADMIN_PASSWORD: Match.anyValue(),
            AWS_CRYPTO_TAX_ID_ENCRYPTED_HASHING_SALT: Match.anyValue(),
            API_BASE_URL: Match.anyValue(),
            USERS_TABLE: "users-table-local",
            BUSINESSES_TABLE: "businesses-table-local",
          }),
        },
      });
    }).not.toThrow();
  });

  it("creates the migrateUsersVersion Lambda with correct environment variables", () => {
    expect(() => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: Match.stringLikeRegexp("businessnjgov-api-local-migrateUsersVersion"),
        Runtime: "nodejs20.x",
        Environment: {
          Variables: Match.objectLike({
            USERS_TABLE: "users-table-local",
            BUSINESSES_TABLE: "businesses-table-local",
          }),
        },
      });
    }).not.toThrow();
  });

  it("creates the updateExternalStatus Lambda with correct environment variables", () => {
    expect(() => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: Match.stringLikeRegexp("businessnjgov-api-local-updateExternalStatus"),
        Runtime: "nodejs20.x",
        Environment: {
          Variables: Match.objectLike({
            USERS_TABLE: "users-table-local",
            BUSINESSES_TABLE: "businesses-table-local",
          }),
        },
      });
    }).not.toThrow();
  });

  it("creates the healthCheck Lambda with correct environment variables", () => {
    expect(() => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: Match.stringLikeRegexp("businessnjgov-api-local-healthCheck"),
        Runtime: "nodejs20.x",
        Environment: {
          Variables: Match.objectLike({
            STAGE: "local",
            API_BASE_URL: Match.anyValue(),
          }),
        },
      });
    }).not.toThrow();
  });

  it("creates the updateKillSwitchParameter Lambda with correct environment variables", () => {
    expect(() => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: Match.stringLikeRegexp("businessnjgov-api-local-updateKillSwitchParameter"),
        Runtime: "nodejs20.x",
        Environment: {
          Variables: Match.objectLike({
            STAGE: "local",
          }),
        },
      });
    }).not.toThrow();
  });
});

import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { IamStack, IamStackProps } from "../lib/iamStack";
import { LambdaStack, LambdaStackProps } from "../lib/lambdaStack";

describe("LambdaStack", () => {
  let app: App;
  let stack: LambdaStack;
  let template: Template;
  let iamStack: IamStack;

  beforeEach(() => {
    app = new App();
    iamStack = new IamStack(app, "TestIamStack", { stage: "local" } as IamStackProps);
    const defaultProps: LambdaStackProps = {
      stage: "local",
      lambdaRole: iamStack.role,
      messagesBucket: {
        bucketName: "messages-bucket-local",
        grantWrite: () => {},
      } as unknown as IBucket,
    };

    stack = new LambdaStack(app, "TestLambdaStack", defaultProps);
    template = Template.fromStack(stack);
  });

  test("creates the express Lambda with correct environment variables", () => {
    expect(() => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: Match.stringLikeRegexp("businessnjgov-api-v2-local-express"),
        Runtime: "nodejs22.x",
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

  test("creates the migrateUsersVersion Lambda with correct environment variables", () => {
    expect(() => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: Match.stringLikeRegexp("businessnjgov-api-v2-local-migrateUsersVersion"),
        Runtime: "nodejs22.x",
        Environment: {
          Variables: Match.objectLike({
            USERS_TABLE: "users-table-local",
            BUSINESSES_TABLE: "businesses-table-local",
          }),
        },
      });
    }).not.toThrow();
  });

  test("creates the updateExternalStatus Lambda with correct environment variables", () => {
    expect(() => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: Match.stringLikeRegexp("businessnjgov-api-v2-local-updateExternalStatus"),
        Runtime: "nodejs22.x",
        Environment: {
          Variables: Match.objectLike({
            USERS_TABLE: "users-table-local",
            BUSINESSES_TABLE: "businesses-table-local",
          }),
        },
      });
    }).not.toThrow();
  });

  test("creates the healthCheck Lambda with correct environment variables", () => {
    expect(() => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: Match.stringLikeRegexp("businessnjgov-api-v2-local-healthCheck"),
        Runtime: "nodejs22.x",
        Environment: {
          Variables: Match.objectLike({
            STAGE: "local",
            API_BASE_URL: Match.anyValue(),
          }),
        },
      });
    }).not.toThrow();
  });

  test("creates the updateKillSwitchParameter Lambda with correct environment variables", () => {
    expect(() => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: Match.stringLikeRegexp(
          "businessnjgov-api-v2-local-updateKillSwitchParameter",
        ),
        Runtime: "nodejs22.x",
        Environment: {
          Variables: Match.objectLike({
            STAGE: "local",
          }),
        },
      });
    }).not.toThrow();
  });
});

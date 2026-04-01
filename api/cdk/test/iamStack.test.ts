import { API_SERVICE_NAME } from "@businessnjgovnavigator/api/src/libs/constants";
import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { IamStack, IamStackProps } from "../lib/iamStack";

// Store original value and set test identity pool ID at module level
const originalIdentityPoolId = process.env.COGNITO_IDENTITY_POOL_ID;
const TEST_IDENTITY_POOL_ID = "us-east-1:test-identity-pool-id";

describe("IamStack", () => {
  let app: App;
  let stack: IamStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    const props: IamStackProps = { stage: "local" };
    stack = new IamStack(app, "TestIamStack", props);
    template = Template.fromStack(stack);
  });

  test("creates the lambda IAM role with correct name", () => {
    expect(() => {
      template.hasResourceProperties("AWS::IAM::Role", {
        RoleName: `${API_SERVICE_NAME}-local-lambdaRole`,
        AssumeRolePolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: { Service: "lambda.amazonaws.com" },
            }),
          ]),
        },
      });
    }).not.toThrow();
  });

  test("attaches managed policies to lambda role", () => {
    expect(() => {
      template.hasResourceProperties("AWS::IAM::Role", {
        ManagedPolicyArns: Match.arrayWith([
          Match.objectLike({
            "Fn::Join": Match.arrayWith([
              "",
              Match.arrayWith([Match.stringLikeRegexp("CloudWatchLogsFullAccess")]),
            ]),
          }),
          Match.objectLike({
            "Fn::Join": Match.arrayWith([
              "",
              Match.arrayWith([Match.stringLikeRegexp("AWSLambdaVPCAccessExecutionRole")]),
            ]),
          }),
        ]),
      });
    }).not.toThrow();
  });

  test("inline policy: PutMetricDataForCloudwatchResources", () => {
    expect(() => {
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Sid: "PutMetricDataForCloudwatchResources",
              Action: "cloudwatch:PutMetricData",
              Resource: "*",
              Effect: "Allow",
            }),
          ]),
        },
      });
    }).not.toThrow();
  });

  test("does NOT include SNS publish policy outside dev", () => {
    expect(() => {
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: "sns:Publish",
              Effect: "Allow",
              Resource: Match.anyValue(),
              Sid: "SnsPublishPolicyToCmsAlertTopic",
            }),
          ]),
        },
      });
    }).toThrow();
  });

  test("inline policy: SecretsManager GetSecretValue", () => {
    expect(() => {
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: "secretsmanager:GetSecretValue",
              Effect: "Allow",
              Resource: Match.anyValue(),
              Sid: "SecretsManagerGetSecretValue",
            }),
          ]),
        },
      });
    }).not.toThrow();
  });

  test("inline policy: S3 write access to documents bucket", () => {
    expect(() => {
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: ["s3:PutObject", "s3:ListBucket", "s3:GetObject"],
              Effect: "Allow",
              Resource: Match.stringLikeRegexp("arn:aws:s3:::nj-bfs-user-documents-local/\\*"),
              Sid: "S3PermissionForDocumentsStorageBucket",
            }),
          ]),
        },
      });
    }).not.toThrow();
  });

  test("inline policy: SSM access", () => {
    expect(() => {
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: ["ssm:GetParameter", "ssm:PutParameter"],
              Effect: "Allow",
              Resource: Match.anyValue(),
              Sid: "SSMParameterPermissions",
            }),
          ]),
        },
      });
    }).not.toThrow();
  });

  test("inline policy: DynamoDB access", () => {
    expect(() => {
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: [
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:PartiQLSelect",
              ],
              Effect: "Allow",
              Resource: Match.anyValue(),
              Sid: "DynamoDBAccessPolicy",
            }),
          ]),
        },
      });
    }).not.toThrow();
  });

  test("inline policy: CloudWatch logs access", () => {
    expect(() => {
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: [
                "logs:CreateLogStream",
                "logs:CreateLogGroup",
                "logs:TagResource",
                "logs:PutLogEvents",
              ],
              Effect: "Allow",
              Resource: Match.anyValue(),
              Sid: "CloudWatchLogsPermissions",
            }),
          ]),
        },
      });
    }).not.toThrow();
  });

  test("inline policy: S3 read access", () => {
    expect(() => {
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: "s3:GetObject",
              Resource: Match.stringLikeRegexp("arn:aws:s3:::.*"),
              Effect: "Allow",
            }),
          ]),
        },
      });
    }).not.toThrow();
  });

  test("includes SNS publish policy in dev environment", () => {
    const devApp = new App();
    const devProps: IamStackProps = { stage: "dev" };
    const devStack = new IamStack(devApp, "TestIamStackDev", devProps);
    const devTemplate = Template.fromStack(devStack);

    expect(() => {
      devTemplate.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: "sns:Publish",
              Effect: "Allow",
              Resource: Match.anyValue(),
              Sid: "SnsPublishPolicyToCmsAlertTopic",
            }),
          ]),
        },
      });
    }).not.toThrow();
  });

  describe("Cognito Identity Pool Roles", () => {
    beforeAll(() => {
      // Set environment variable for identity pool before all tests in this block
      process.env.COGNITO_IDENTITY_POOL_ID = TEST_IDENTITY_POOL_ID;
    });

    afterAll(() => {
      // Restore original value
      if (originalIdentityPoolId) {
        process.env.COGNITO_IDENTITY_POOL_ID = originalIdentityPoolId;
      } else {
        delete process.env.COGNITO_IDENTITY_POOL_ID;
      }
    });

    let identityPoolApp: App;
    let identityPoolStack: IamStack;
    let identityPoolTemplate: Template;

    beforeEach(() => {
      identityPoolApp = new App();
      const props: IamStackProps = { stage: "dev" };
      identityPoolStack = new IamStack(identityPoolApp, "TestIamStackWithIdentityPool", props);
      identityPoolTemplate = Template.fromStack(identityPoolStack);
    });

    test("creates authenticated role when identity pool ID is provided", () => {
      expect(() => {
        identityPoolTemplate.hasResourceProperties("AWS::IAM::Role", {
          RoleName: "navigator_authRole",
          AssumeRolePolicyDocument: {
            Statement: Match.arrayWith([
              Match.objectLike({
                Action: "sts:AssumeRoleWithWebIdentity",
                Effect: "Allow",
                Principal: { Federated: "cognito-identity.amazonaws.com" },
                Condition: {
                  StringEquals: {
                    "cognito-identity.amazonaws.com:aud": TEST_IDENTITY_POOL_ID,
                  },
                  "ForAnyValue:StringLike": {
                    "cognito-identity.amazonaws.com:amr": "authenticated",
                  },
                },
              }),
            ]),
          },
        });
      }).not.toThrow();
    });

    test("creates unauthenticated role when identity pool ID is provided", () => {
      expect(() => {
        identityPoolTemplate.hasResourceProperties("AWS::IAM::Role", {
          RoleName: "navigator_unauthRole",
          AssumeRolePolicyDocument: {
            Statement: Match.arrayWith([
              Match.objectLike({
                Action: "sts:AssumeRoleWithWebIdentity",
                Effect: "Allow",
                Principal: { Federated: "cognito-identity.amazonaws.com" },
                Condition: {
                  StringEquals: {
                    "cognito-identity.amazonaws.com:aud": TEST_IDENTITY_POOL_ID,
                  },
                  "ForAnyValue:StringLike": {
                    "cognito-identity.amazonaws.com:amr": "unauthenticated",
                  },
                },
              }),
            ]),
          },
        });
      }).not.toThrow();
    });

    test("exports authRole and unauthRole as public properties", () => {
      expect(identityPoolStack.authRole).toBeDefined();
      expect(identityPoolStack.unauthRole).toBeDefined();
      // Role names and ARNs are CDK tokens at synth time, verified in other tests
      expect(identityPoolStack.authRole?.roleArn).toBeDefined();
      expect(identityPoolStack.unauthRole?.roleArn).toBeDefined();
    });

    test("does not create identity pool roles when COGNITO_IDENTITY_POOL_ID is not set", () => {
      delete process.env.COGNITO_IDENTITY_POOL_ID;

      const noIdentityPoolApp = new App();
      const noIdentityPoolStack = new IamStack(
        noIdentityPoolApp,
        "TestIamStackNoIdentityPool",
        { stage: "local" },
      );

      expect(noIdentityPoolStack.authRole).toBeUndefined();
      expect(noIdentityPoolStack.unauthRole).toBeUndefined();
    });
  });
});

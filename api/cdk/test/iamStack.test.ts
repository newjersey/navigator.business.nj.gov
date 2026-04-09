import { API_SERVICE_NAME } from "@businessnjgovnavigator/api/src/libs/constants";
import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { IamStack, IamStackProps } from "../lib/iamStack";

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

  describe("Cognito Identity Pool roles", () => {
    test("does NOT create auth/unauth roles when identityPoolIds not provided", () => {
      const localApp = new App();
      const localProps: IamStackProps = { stage: "local" };
      const localStack = new IamStack(localApp, "TestIamStackLocal", localProps);
      const localTemplate = Template.fromStack(localStack);

      const roles = localTemplate.findResources("AWS::IAM::Role");
      const roleNames = Object.values(roles).map((role) => role.Properties?.RoleName as string);

      expect(roleNames).not.toContain("navigator_authRole");
      expect(roleNames).not.toContain("navigator_unauthRole");
    });

    test("creates auth role with correct configuration when identityPoolIds provided", () => {
      const testApp = new App();
      const testProps: IamStackProps = {
        stage: "dev",
        identityPoolIds: ["us-east-1:test-pool-id-1", "us-east-1:test-pool-id-2"],
      };
      const testStack = new IamStack(testApp, "TestIamStackWithPools", testProps);
      const testTemplate = Template.fromStack(testStack);

      expect(() => {
        testTemplate.hasResourceProperties("AWS::IAM::Role", {
          RoleName: "navigator_authRole",
          AssumeRolePolicyDocument: {
            Statement: [
              {
                Action: "sts:AssumeRoleWithWebIdentity",
                Condition: {
                  StringEquals: {
                    "cognito-identity.amazonaws.com:aud": [
                      "us-east-1:test-pool-id-1",
                      "us-east-1:test-pool-id-2",
                    ],
                  },
                  "ForAnyValue:StringLike": {
                    "cognito-identity.amazonaws.com:amr": "authenticated",
                  },
                },
                Effect: "Allow",
                Principal: {
                  Federated: "cognito-identity.amazonaws.com",
                },
              },
            ],
            Version: "2012-10-17",
          },
        });
      }).not.toThrow();
    });

    test("creates unauth role with correct configuration when identityPoolIds provided", () => {
      const testApp = new App();
      const testProps: IamStackProps = {
        stage: "dev",
        identityPoolIds: ["us-east-1:test-pool-id-1", "us-east-1:test-pool-id-2"],
      };
      const testStack = new IamStack(testApp, "TestIamStackWithPools", testProps);
      const testTemplate = Template.fromStack(testStack);

      expect(() => {
        testTemplate.hasResourceProperties("AWS::IAM::Role", {
          RoleName: "navigator_unauthRole",
          AssumeRolePolicyDocument: {
            Statement: [
              {
                Action: "sts:AssumeRoleWithWebIdentity",
                Condition: {
                  StringEquals: {
                    "cognito-identity.amazonaws.com:aud": [
                      "us-east-1:test-pool-id-1",
                      "us-east-1:test-pool-id-2",
                    ],
                  },
                  "ForAnyValue:StringLike": {
                    "cognito-identity.amazonaws.com:amr": "unauthenticated",
                  },
                },
                Effect: "Allow",
                Principal: {
                  Federated: "cognito-identity.amazonaws.com",
                },
              },
            ],
            Version: "2012-10-17",
          },
        });
      }).not.toThrow();
    });

    test("creates both auth and unauth roles when identityPoolIds provided", () => {
      const testApp = new App();
      const testProps: IamStackProps = {
        stage: "dev",
        identityPoolIds: ["us-east-1:test-pool-id"],
      };
      const testStack = new IamStack(testApp, "TestIamStackWithPool", testProps);
      const testTemplate = Template.fromStack(testStack);

      const roles = testTemplate.findResources("AWS::IAM::Role");
      const roleNames = Object.values(roles).map((role) => role.Properties?.RoleName as string);

      expect(roleNames).toContain("navigator_authRole");
      expect(roleNames).toContain("navigator_unauthRole");
    });

    test("supports single identity pool ID", () => {
      const testApp = new App();
      const testProps: IamStackProps = {
        stage: "prod",
        identityPoolIds: ["us-east-1:single-pool-id"],
      };
      const testStack = new IamStack(testApp, "TestIamStackSinglePool", testProps);
      const testTemplate = Template.fromStack(testStack);

      expect(() => {
        testTemplate.hasResourceProperties("AWS::IAM::Role", {
          RoleName: "navigator_authRole",
          AssumeRolePolicyDocument: {
            Statement: [
              {
                Condition: {
                  StringEquals: {
                    "cognito-identity.amazonaws.com:aud": ["us-east-1:single-pool-id"],
                  },
                  "ForAnyValue:StringLike": Match.anyValue(),
                },
                Effect: "Allow",
                Principal: {
                  Federated: "cognito-identity.amazonaws.com",
                },
              },
            ],
          },
        });
      }).not.toThrow();
    });

    test("does NOT create roles when identityPoolIds is empty array", () => {
      const testApp = new App();
      const testProps: IamStackProps = {
        stage: "local",
        identityPoolIds: [],
      };
      const testStack = new IamStack(testApp, "TestIamStackEmptyPools", testProps);
      const testTemplate = Template.fromStack(testStack);

      const roles = testTemplate.findResources("AWS::IAM::Role");
      const roleNames = Object.values(roles).map((role) => role.Properties?.RoleName as string);

      expect(roleNames).not.toContain("navigator_authRole");
      expect(roleNames).not.toContain("navigator_unauthRole");
    });
  });
});

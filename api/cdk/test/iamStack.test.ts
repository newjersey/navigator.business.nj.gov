import { API_SERVICE_NAME } from "@businessnjgovnavigator/api/src/libs/constants";
import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { IamStack, IamStackProps } from "../lib/iamStack";

describe("IamStack", () => {
  let app: App;
  let stack: IamStack;
  let template: Template;
  let originalCognitoIdentityPoolId: string | undefined;

  beforeEach(() => {
    originalCognitoIdentityPoolId = process.env.COGNITO_IDENTITY_POOL_ID;
    process.env.COGNITO_IDENTITY_POOL_ID = "us-east-1:single-pool-id";

    app = new App();
    const props: IamStackProps = { stage: "local" };
    stack = new IamStack(app, "TestIamStack", props);
    template = Template.fromStack(stack);
  });

  afterEach(() => {
    if (originalCognitoIdentityPoolId === undefined) {
      delete process.env.COGNITO_IDENTITY_POOL_ID;
    } else {
      process.env.COGNITO_IDENTITY_POOL_ID = originalCognitoIdentityPoolId;
    }
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
    // Dev stage requires SHARED_IDENTITY_POOL_IDS environment variable
    const originalSharedIds = process.env.SHARED_IDENTITY_POOL_IDS;
    process.env.SHARED_IDENTITY_POOL_IDS = "us-east-1:dev-test-pool-id";

    const devApp = new App();
    const devProps: IamStackProps = { stage: "dev" };
    const devStack = new IamStack(devApp, "TestIamStackDev", devProps);
    const devTemplate = Template.fromStack(devStack);

    // Restore original env var
    if (originalSharedIds === undefined) {
      delete process.env.SHARED_IDENTITY_POOL_IDS;
    } else {
      process.env.SHARED_IDENTITY_POOL_IDS = originalSharedIds;
    }

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
    let originalSharedIdentityPoolIds: string | undefined;

    beforeEach(() => {
      originalSharedIdentityPoolIds = process.env.SHARED_IDENTITY_POOL_IDS;
    });

    afterEach(() => {
      if (originalSharedIdentityPoolIds === undefined) {
        delete process.env.SHARED_IDENTITY_POOL_IDS;
      } else {
        process.env.SHARED_IDENTITY_POOL_IDS = originalSharedIdentityPoolIds;
      }
    });

    test("throws error for dev stage when SHARED_IDENTITY_POOL_IDS not set", () => {
      delete process.env.SHARED_IDENTITY_POOL_IDS;
      const testApp = new App();
      const testProps: IamStackProps = { stage: "dev" };

      expect(() => {
        new IamStack(testApp, "TestIamStackDevNoEnv", testProps);
      }).toThrow("SHARED_IDENTITY_POOL_IDS must be set for dev");
    });

    test("creates auth role with correct configuration for dev stage with multiple pools", () => {
      process.env.SHARED_IDENTITY_POOL_IDS = "us-east-1:test-pool-id-1, us-east-1:test-pool-id-2";
      const testApp = new App();
      const testProps: IamStackProps = { stage: "dev" };
      const testStack = new IamStack(testApp, "TestIamStackDevWithPools", testProps);
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

    test("creates unauth role with correct configuration for dev stage with multiple pools", () => {
      process.env.SHARED_IDENTITY_POOL_IDS = "us-east-1:test-pool-id-1, us-east-1:test-pool-id-2";
      const testApp = new App();
      const testProps: IamStackProps = { stage: "dev" };
      const testStack = new IamStack(testApp, "TestIamStackDevWithPools2", testProps);
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

    test("creates both auth and unauth roles for dev stage", () => {
      process.env.SHARED_IDENTITY_POOL_IDS = "us-east-1:test-pool-id";
      const testApp = new App();
      const testProps: IamStackProps = { stage: "dev" };
      const testStack = new IamStack(testApp, "TestIamStackDevWithPool", testProps);
      const testTemplate = Template.fromStack(testStack);

      const roles = testTemplate.findResources("AWS::IAM::Role");
      const roleNames = Object.values(roles).map((role) => role.Properties?.RoleName as string);

      expect(roleNames).toContain("navigator_authRole");
      expect(roleNames).toContain("navigator_unauthRole");
    });

    test("supports single identity pool ID for non-dev stages", () => {
      const testApp = new App();
      const testProps: IamStackProps = { stage: "prod" };
      const testStack = new IamStack(testApp, "TestIamStackProdSinglePool", testProps);
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

    test("creates both auth and unauth roles for non-dev stages", () => {
      const testApp = new App();
      const testProps: IamStackProps = { stage: "prod" };
      const testStack = new IamStack(testApp, "TestIamStackProdWithPool", testProps);
      const testTemplate = Template.fromStack(testStack);

      const roles = testTemplate.findResources("AWS::IAM::Role");
      const roleNames = Object.values(roles).map((role) => role.Properties?.RoleName as string);

      expect(roleNames).toContain("navigator_authRole");
      expect(roleNames).toContain("navigator_unauthRole");
    });
  });
});

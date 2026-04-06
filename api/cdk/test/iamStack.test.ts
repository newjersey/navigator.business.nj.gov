import { API_SERVICE_NAME } from "@businessnjgovnavigator/api/src/libs/constants";
import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { IamStack, IamStackProps } from "../lib/iamStack";

// Store original value and set test identity pool IDs at module level
const originalSharedIdentityPoolIds = process.env.SHARED_IDENTITY_POOL_IDS;
const TEST_IDENTITY_POOL_ID = "us-east-1:test-identity-pool-id";
const TEST_IDENTITY_POOL_ID_2 = "us-east-1:test-identity-pool-id-2";
const TEST_IDENTITY_POOL_ID_3 = "us-east-1:test-identity-pool-id-3";

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
      process.env.SHARED_IDENTITY_POOL_IDS = TEST_IDENTITY_POOL_ID;
    });

    afterAll(() => {
      // Restore original value
      if (originalSharedIdentityPoolIds) {
        process.env.SHARED_IDENTITY_POOL_IDS = originalSharedIdentityPoolIds;
      } else {
        delete process.env.SHARED_IDENTITY_POOL_IDS;
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
                    "cognito-identity.amazonaws.com:aud": [TEST_IDENTITY_POOL_ID],
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
                    "cognito-identity.amazonaws.com:aud": [TEST_IDENTITY_POOL_ID],
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

    test("does not create identity pool roles when SHARED_IDENTITY_POOL_IDS is not set", () => {
      delete process.env.SHARED_IDENTITY_POOL_IDS;

      const noIdentityPoolApp = new App();
      const noIdentityPoolStack = new IamStack(noIdentityPoolApp, "TestIamStackNoIdentityPool", {
        stage: "local",
      });

      expect(noIdentityPoolStack.authRole).toBeUndefined();
      expect(noIdentityPoolStack.unauthRole).toBeUndefined();
    });

    test("creates roles with multiple identity pool IDs for shared environment", () => {
      // Set up multiple identity pool IDs
      const multiplePoolIds = `${TEST_IDENTITY_POOL_ID},${TEST_IDENTITY_POOL_ID_2},${TEST_IDENTITY_POOL_ID_3}`;
      process.env.SHARED_IDENTITY_POOL_IDS = multiplePoolIds;

      const multiPoolApp = new App();
      const multiPoolStack = new IamStack(multiPoolApp, "TestIamStackMultiPool", { stage: "dev" });
      const multiPoolTemplate = Template.fromStack(multiPoolStack);

      // Test authenticated role with multiple identity pool IDs
      expect(() => {
        multiPoolTemplate.hasResourceProperties("AWS::IAM::Role", {
          RoleName: "navigator_authRole",
          AssumeRolePolicyDocument: {
            Statement: Match.arrayWith([
              Match.objectLike({
                Action: "sts:AssumeRoleWithWebIdentity",
                Effect: "Allow",
                Principal: { Federated: "cognito-identity.amazonaws.com" },
                Condition: {
                  StringEquals: {
                    "cognito-identity.amazonaws.com:aud": [
                      TEST_IDENTITY_POOL_ID,
                      TEST_IDENTITY_POOL_ID_2,
                      TEST_IDENTITY_POOL_ID_3,
                    ],
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

      // Test unauthenticated role with multiple identity pool IDs
      expect(() => {
        multiPoolTemplate.hasResourceProperties("AWS::IAM::Role", {
          RoleName: "navigator_unauthRole",
          AssumeRolePolicyDocument: {
            Statement: Match.arrayWith([
              Match.objectLike({
                Action: "sts:AssumeRoleWithWebIdentity",
                Effect: "Allow",
                Principal: { Federated: "cognito-identity.amazonaws.com" },
                Condition: {
                  StringEquals: {
                    "cognito-identity.amazonaws.com:aud": [
                      TEST_IDENTITY_POOL_ID,
                      TEST_IDENTITY_POOL_ID_2,
                      TEST_IDENTITY_POOL_ID_3,
                    ],
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
  });

  describe("Bedrock Role and Policies", () => {
    const originalDevUsernames = process.env.DEV_USERNAMES;

    afterEach(() => {
      // Restore original value
      if (originalDevUsernames) {
        process.env.DEV_USERNAMES = originalDevUsernames;
      } else {
        delete process.env.DEV_USERNAMES;
      }
    });

    test("creates Bedrock role in dev environment with dev usernames", () => {
      process.env.DEV_USERNAMES = "user1,user2,user3";

      const bedrockApp = new App();
      const bedrockStack = new IamStack(bedrockApp, "TestIamStackBedrock", { stage: "dev" });
      const bedrockTemplate = Template.fromStack(bedrockStack);

      expect(() => {
        bedrockTemplate.hasResourceProperties("AWS::IAM::Role", {
          RoleName: "ContinuousChatAnalysisBedrockRole",
          AssumeRolePolicyDocument: {
            Statement: Match.arrayWith([
              Match.objectLike({
                Effect: "Allow",
                Principal: {
                  AWS: Match.arrayWith([
                    Match.stringLikeRegexp("arn:aws:iam::\\d+:user/users/user1-cli-access"),
                    Match.stringLikeRegexp("arn:aws:iam::\\d+:user/users/user2-cli-access"),
                    Match.stringLikeRegexp("arn:aws:iam::\\d+:user/users/user3-cli-access"),
                  ]),
                },
                Action: "sts:AssumeRole",
              }),
            ]),
          },
        });
      }).not.toThrow();
    });

    test("Bedrock role has correct permissions", () => {
      process.env.DEV_USERNAMES = "user1";

      const bedrockApp = new App();
      const bedrockStack = new IamStack(bedrockApp, "TestIamStackBedrockPerms", { stage: "dev" });
      const bedrockTemplate = Template.fromStack(bedrockStack);

      expect(() => {
        bedrockTemplate.hasResourceProperties("AWS::IAM::Policy", {
          PolicyDocument: {
            Statement: Match.arrayWith([
              Match.objectLike({
                Effect: "Allow",
                Action: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
                Resource: "*",
              }),
            ]),
          },
        });
      }).not.toThrow();
    });

    test("creates AssumeBedrockRolePolicy managed policy", () => {
      process.env.DEV_USERNAMES = "user1";

      const bedrockApp = new App();
      const bedrockStack = new IamStack(bedrockApp, "TestIamStackBedrockAssume", { stage: "dev" });
      const bedrockTemplate = Template.fromStack(bedrockStack);

      expect(() => {
        bedrockTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "AssumeBedrockRolePolicy",
          PolicyDocument: {
            Statement: Match.arrayWith([
              Match.objectLike({
                Effect: "Allow",
                Action: "sts:AssumeRole",
                Resource: Match.stringLikeRegexp("arn:aws:iam::\\d+:role/ContinuousChatAnalysisBedrockRole"),
              }),
            ]),
          },
        });
      }).not.toThrow();
    });

    test("does not create Bedrock role in non-dev environments", () => {
      process.env.DEV_USERNAMES = "user1";

      const stagingApp = new App();
      const stagingStack = new IamStack(stagingApp, "TestIamStackStagingNoBedrock", {
        stage: "staging",
      });
      const stagingTemplate = Template.fromStack(stagingStack);

      // Should not find Bedrock role
      expect(() => {
        stagingTemplate.hasResourceProperties("AWS::IAM::Role", {
          RoleName: "ContinuousChatAnalysisBedrockRole",
        });
      }).toThrow();
    });

    test("does not create Bedrock role when DEV_USERNAMES is not set", () => {
      delete process.env.DEV_USERNAMES;

      const noUsernamesApp = new App();
      const noUsernamesStack = new IamStack(noUsernamesApp, "TestIamStackNoUsernames", {
        stage: "dev",
      });
      const noUsernamesTemplate = Template.fromStack(noUsernamesStack);

      // Should not find Bedrock role
      expect(() => {
        noUsernamesTemplate.hasResourceProperties("AWS::IAM::Role", {
          RoleName: "ContinuousChatAnalysisBedrockRole",
        });
      }).toThrow();
    });
  });

  describe("Deployment Policies (Dev Only)", () => {
    const originalContentEcsArn = process.env.CONTENT_ECS_SERVICE_ARN;
    const originalTestingEcsArn = process.env.TESTING_ECS_SERVICE_ARN;
    const originalDeploymentPolicyJson = process.env.BFS_DEPLOYMENT_POLICY_JSON;

    afterEach(() => {
      // Restore original values
      if (originalContentEcsArn) {
        process.env.CONTENT_ECS_SERVICE_ARN = originalContentEcsArn;
      } else {
        delete process.env.CONTENT_ECS_SERVICE_ARN;
      }

      if (originalTestingEcsArn) {
        process.env.TESTING_ECS_SERVICE_ARN = originalTestingEcsArn;
      } else {
        delete process.env.TESTING_ECS_SERVICE_ARN;
      }

      if (originalDeploymentPolicyJson) {
        process.env.BFS_DEPLOYMENT_POLICY_JSON = originalDeploymentPolicyJson;
      } else {
        delete process.env.BFS_DEPLOYMENT_POLICY_JSON;
      }
    });

    test("creates content deployment policy in dev environment", () => {
      const testArn = "arn:aws:ecs:us-east-1:123456789012:service/bfs-navigator-content/service-name";
      process.env.CONTENT_ECS_SERVICE_ARN = testArn;

      const contentApp = new App();
      const contentStack = new IamStack(contentApp, "TestIamStackContent", { stage: "dev" });
      const contentTemplate = Template.fromStack(contentStack);

      expect(() => {
        contentTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-content-deployment-policy",
          PolicyDocument: {
            Statement: Match.arrayWith([
              Match.objectLike({
                Effect: "Allow",
                Action: "ecs:UpdateService",
                Resource: testArn,
              }),
            ]),
          },
        });
      }).not.toThrow();
    });

    test("creates testing deployment policy in dev environment", () => {
      const testArn = "arn:aws:ecs:us-east-1:123456789012:service/bfs-navigator-testing/service-name";
      process.env.TESTING_ECS_SERVICE_ARN = testArn;

      const testingApp = new App();
      const testingStack = new IamStack(testingApp, "TestIamStackTesting", { stage: "dev" });
      const testingTemplate = Template.fromStack(testingStack);

      expect(() => {
        testingTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-testing-deployment-policy",
          PolicyDocument: {
            Statement: Match.arrayWith([
              Match.objectLike({
                Effect: "Allow",
                Action: "ecs:UpdateService",
                Resource: testArn,
              }),
            ]),
          },
        });
      }).not.toThrow();
    });

    test("creates main deployment policy when JSON is provided", () => {
      const policyJson = JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:PutObject"],
            Resource: "arn:aws:s3:::example-bucket/*",
          },
        ],
      });
      process.env.BFS_DEPLOYMENT_POLICY_JSON = policyJson;

      const deployApp = new App();
      const deployStack = new IamStack(deployApp, "TestIamStackDeploy", { stage: "dev" });
      const deployTemplate = Template.fromStack(deployStack);

      expect(() => {
        deployTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-deployment-policy",
          PolicyDocument: {
            Statement: Match.arrayWith([
              Match.objectLike({
                Effect: "Allow",
                Action: ["s3:GetObject", "s3:PutObject"],
                Resource: "arn:aws:s3:::example-bucket/*",
              }),
            ]),
          },
        });
      }).not.toThrow();
    });

    test("does not create deployment policies in non-dev environments", () => {
      process.env.CONTENT_ECS_SERVICE_ARN =
        "arn:aws:ecs:us-east-1:123456789012:service/bfs-navigator-content/service-name";
      process.env.TESTING_ECS_SERVICE_ARN =
        "arn:aws:ecs:us-east-1:123456789012:service/bfs-navigator-testing/service-name";

      const stagingApp = new App();
      const stagingStack = new IamStack(stagingApp, "TestIamStackStagingNoDeploy", {
        stage: "staging",
      });
      const stagingTemplate = Template.fromStack(stagingStack);

      // Should not find content deployment policy
      expect(() => {
        stagingTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-content-deployment-policy",
        });
      }).toThrow();

      // Should not find testing deployment policy
      expect(() => {
        stagingTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-testing-deployment-policy",
        });
      }).toThrow();
    });

    test("does not create deployment policies when environment variables are not set", () => {
      delete process.env.CONTENT_ECS_SERVICE_ARN;
      delete process.env.TESTING_ECS_SERVICE_ARN;
      delete process.env.BFS_DEPLOYMENT_POLICY_JSON;

      const noEnvApp = new App();
      const noEnvStack = new IamStack(noEnvApp, "TestIamStackNoEnv", { stage: "dev" });
      const noEnvTemplate = Template.fromStack(noEnvStack);

      // Should not find any deployment policies
      expect(() => {
        noEnvTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-content-deployment-policy",
        });
      }).toThrow();

      expect(() => {
        noEnvTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-testing-deployment-policy",
        });
      }).toThrow();

      expect(() => {
        noEnvTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-deployment-policy",
        });
      }).toThrow();
    });
  });

  describe("IAM Users and Groups", () => {
    const originalEnvVars = {
      DEV_USERNAMES: process.env.DEV_USERNAMES,
      TERRAFORM_USERNAMES: process.env.TERRAFORM_USERNAMES,
      SSM_PARAMETER_ARNS: process.env.SSM_PARAMETER_ARNS,
      KMS_KEY_ARNS: process.env.KMS_KEY_ARNS,
      LOCAL_S3_BUCKET_NAME: process.env.LOCAL_S3_BUCKET_NAME,
      CONTENT_ECS_SERVICE_ARN: process.env.CONTENT_ECS_SERVICE_ARN,
      TESTING_ECS_SERVICE_ARN: process.env.TESTING_ECS_SERVICE_ARN,
      BFS_DEPLOYMENT_POLICY_JSON: process.env.BFS_DEPLOYMENT_POLICY_JSON,
    };

    let devApp: App;
    let devStack: IamStack;
    let devTemplate: Template;

    beforeAll(() => {
      // Set up environment variables for user/group resources
      process.env.DEV_USERNAMES = "alice,bob";
      process.env.TERRAFORM_USERNAMES = "charlie,dave";
      process.env.SSM_PARAMETER_ARNS =
        "arn:aws:ssm:us-east-1:123456789012:parameter/test1,arn:aws:ssm:us-east-1:123456789012:parameter/test2";
      process.env.KMS_KEY_ARNS =
        "arn:aws:kms:us-east-1:123456789012:key/test-key-1,arn:aws:kms:us-east-1:123456789012:key/test-key-2";
      process.env.LOCAL_S3_BUCKET_NAME = "test-local-bucket";
      process.env.CONTENT_ECS_SERVICE_ARN =
        "arn:aws:ecs:us-east-1:123456789012:service/content-cluster/content-service";
      process.env.TESTING_ECS_SERVICE_ARN =
        "arn:aws:ecs:us-east-1:123456789012:service/testing-cluster/testing-service";
      process.env.BFS_DEPLOYMENT_POLICY_JSON = JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "s3:ListBucket",
            Resource: "*",
          },
        ],
      });
    });

    afterAll(() => {
      // Restore original environment variables
      Object.entries(originalEnvVars).forEach(([key, value]) => {
        if (value !== undefined) {
          process.env[key] = value;
        } else {
          delete process.env[key as keyof typeof originalEnvVars];
        }
      });
    });

    beforeEach(() => {
      devApp = new App();
      devStack = new IamStack(devApp, "TestIamStackUsersGroups", {
        stage: "dev",
        env: { account: "123456789012", region: "us-east-1" },
      });
      devTemplate = Template.fromStack(devStack);
    });

    describe("Navigator Service User", () => {
      test("creates bfs-navigator user with correct path", () => {
        devTemplate.hasResourceProperties("AWS::IAM::User", {
          UserName: "bfs-navigator",
          Path: "/system/",
        });
      });

      test("creates access key for bfs-navigator user", () => {
        devTemplate.hasResourceProperties("AWS::IAM::AccessKey", {
          UserName: "bfs-navigator",
        });
      });

      test("adds bfs-navigator user to bfs group", () => {
        const users = devTemplate.findResources("AWS::IAM::User");
        const navigatorUser = Object.entries(users).find(
          ([_, resource]: [string, any]) => resource.Properties?.UserName === "bfs-navigator",
        );
        expect(navigatorUser).toBeDefined();
        expect(navigatorUser![1].Properties.Groups).toBeDefined();
      });
    });

    describe("Developer Policies", () => {
      test("creates bfs-navigator-dev-policy with SSM and KMS access", () => {
        devTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-navigator-dev-policy",
          Description: "Policy granting devs access to SSM parameters and log group for dev records",
        });

        // Verify SSM permissions
        const policies = devTemplate.findResources("AWS::IAM::ManagedPolicy");
        const devPolicy = Object.values(policies).find(
          (resource: any) => resource.Properties?.ManagedPolicyName === "bfs-navigator-dev-policy",
        ) as any;

        expect(devPolicy).toBeDefined();
        const statements = devPolicy.Properties.PolicyDocument.Statement;

        // Check SSM DescribeParameters
        expect(statements).toContainEqual(
          expect.objectContaining({
            Effect: "Allow",
            Action: ["ssm:DescribeParameters"],
            Resource: "*",
          }),
        );

        // Check KMS permissions
        expect(statements).toContainEqual(
          expect.objectContaining({
            Effect: "Allow",
            Action: ["kms:GenerateDataKey", "kms:Encrypt", "kms:Decrypt"],
          }),
        );

        // Check SSM GetParameter permissions
        expect(statements).toContainEqual(
          expect.objectContaining({
            Effect: "Allow",
            Action: ["ssm:GetParameters", "ssm:GetParameter", "ssm:GetParametersByPath"],
          }),
        );

        // Check CloudWatch Logs permissions
        expect(statements).toContainEqual(
          expect.objectContaining({
            Effect: "Allow",
            Action: expect.arrayContaining([
              "logs:DescribeLogStreams",
              "logs:DescribeLogGroups",
              "logs:PutRetentionPolicy",
              "logs:PutDestination",
              "logs:PutLogEvents",
              "logs:CreateLogStream",
            ]),
          }),
        );
      });

      test("creates bfs-navigator-local-policy in dev environment", () => {
        devTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-navigator-local-policy",
          Description: "Policy granting devs access to local S3 bucket",
        });

        // Verify S3 permissions
        const policies = devTemplate.findResources("AWS::IAM::ManagedPolicy");
        const localPolicy = Object.values(policies).find(
          (resource: any) => resource.Properties?.ManagedPolicyName === "bfs-navigator-local-policy",
        ) as any;

        expect(localPolicy).toBeDefined();
        const statements = localPolicy.Properties.PolicyDocument.Statement;

        expect(statements).toContainEqual(
          expect.objectContaining({
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
            Resource: [
              "arn:aws:s3:::test-local-bucket",
              "arn:aws:s3:::test-local-bucket/*",
            ],
          }),
        );
      });

      test("does not create bfs-navigator-local-policy in non-dev environments", () => {
        const stagingApp = new App();
        const stagingStack = new IamStack(stagingApp, "TestIamStackStaging", { stage: "staging" });
        const stagingTemplate = Template.fromStack(stagingStack);

        expect(() => {
          stagingTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
            ManagedPolicyName: "bfs-navigator-local-policy",
          });
        }).toThrow();
      });
    });

    describe("Developer Group and Users", () => {
      test("creates bfs-navigator-developers group with correct path in dev", () => {
        devTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "bfs-navigator-developers",
          Path: "/users/",
        });
      });

      test("attaches dev and local policies to developers group", () => {
        const groups = devTemplate.findResources("AWS::IAM::Group");
        const developersGroup = Object.values(groups).find(
          (resource: any) => resource.Properties?.GroupName === "bfs-navigator-developers",
        ) as any;

        expect(developersGroup).toBeDefined();
        expect(developersGroup.Properties.ManagedPolicyArns).toBeDefined();
        expect(developersGroup.Properties.ManagedPolicyArns.length).toBeGreaterThanOrEqual(2);
      });

      test("creates dev users from DEV_USERNAMES environment variable", () => {
        devTemplate.hasResourceProperties("AWS::IAM::User", {
          UserName: "alice-cli-access",
          Path: "/users/",
        });

        devTemplate.hasResourceProperties("AWS::IAM::User", {
          UserName: "bob-cli-access",
          Path: "/users/",
        });
      });

      test("creates access keys for each dev user", () => {
        devTemplate.hasResourceProperties("AWS::IAM::AccessKey", {
          UserName: "alice-cli-access",
        });

        devTemplate.hasResourceProperties("AWS::IAM::AccessKey", {
          UserName: "bob-cli-access",
        });
      });

      test("adds dev users to developers group", () => {
        const users = devTemplate.findResources("AWS::IAM::User");
        const aliceUser = Object.entries(users).find(
          ([_, resource]: [string, any]) => resource.Properties?.UserName === "alice-cli-access",
        );

        expect(aliceUser).toBeDefined();
        expect(aliceUser![1].Properties.Groups).toBeDefined();
      });

      test("does not create developers group in non-dev environments", () => {
        const stagingApp = new App();
        const stagingStack = new IamStack(stagingApp, "TestIamStackStaging", { stage: "staging" });
        const stagingTemplate = Template.fromStack(stagingStack);

        expect(() => {
          stagingTemplate.hasResourceProperties("AWS::IAM::Group", {
            GroupName: "bfs-navigator-developers",
          });
        }).toThrow();
      });
    });

    describe("Dev Server User", () => {
      test("creates dev-server-user in dev environment", () => {
        devTemplate.hasResourceProperties("AWS::IAM::User", {
          UserName: "dev-server-user",
          Path: "/users/",
        });
      });

      test("attaches ReadOnlyAccess policy to dev-server-user", () => {
        const users = devTemplate.findResources("AWS::IAM::User");
        const devServerUser = Object.values(users).find(
          (resource: any) => resource.Properties?.UserName === "dev-server-user",
        ) as any;

        expect(devServerUser).toBeDefined();
        expect(devServerUser.Properties.ManagedPolicyArns).toBeDefined();
        expect(devServerUser.Properties.ManagedPolicyArns).toContainEqual(
          expect.objectContaining({
            "Fn::Join": expect.arrayContaining([
              expect.arrayContaining([
                "arn:",
                expect.objectContaining({ Ref: "AWS::Partition" }),
                ":iam::aws:policy/ReadOnlyAccess",
              ]),
            ]),
          }),
        );
      });

      test("creates access key for dev-server-user", () => {
        devTemplate.hasResourceProperties("AWS::IAM::AccessKey", {
          UserName: "dev-server-user",
        });
      });

      test("does not create dev-server-user in non-dev environments", () => {
        const stagingApp = new App();
        const stagingStack = new IamStack(stagingApp, "TestIamStackStaging", { stage: "staging" });
        const stagingTemplate = Template.fromStack(stagingStack);

        expect(() => {
          stagingTemplate.hasResourceProperties("AWS::IAM::User", {
            UserName: "dev-server-user",
          });
        }).toThrow();
      });
    });

    describe("Terraform Policies", () => {
      test("creates aws-terraform-policy with MFA requirement", () => {
        devTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "aws-terraform-policy",
          Description: "Policy granting full access to terraform users, with an mfa key",
        });

        const policies = devTemplate.findResources("AWS::IAM::ManagedPolicy");
        const terraformPolicy = Object.values(policies).find(
          (resource: any) => resource.Properties?.ManagedPolicyName === "aws-terraform-policy",
        ) as any;

        expect(terraformPolicy).toBeDefined();
        const statements = terraformPolicy.Properties.PolicyDocument.Statement;

        expect(statements).toContainEqual(
          expect.objectContaining({
            Effect: "Allow",
            Action: "*",
            Resource: "*",
            Condition: {
              Bool: {
                "aws:MultiFactorAuthPresent": "true",
              },
            },
          }),
        );
      });

      test("creates bfs-config-policy with S3 read access", () => {
        devTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-config-policy",
          Description: "Policy granting developers limited access",
        });

        const policies = devTemplate.findResources("AWS::IAM::ManagedPolicy");
        const configPolicy = Object.values(policies).find(
          (resource: any) => resource.Properties?.ManagedPolicyName === "bfs-config-policy",
        ) as any;

        expect(configPolicy).toBeDefined();
        const statements = configPolicy.Properties.PolicyDocument.Statement;

        expect(statements).toContainEqual(
          expect.objectContaining({
            Effect: "Allow",
            Action: expect.arrayContaining([
              "s3:GetObjectAcl",
              "s3:GetObject",
              "s3:GetBucketTagging",
              "s3:ListBucketVersions",
              "s3:GetObjectTagging",
              "s3:ListBucket",
              "s3:GetBucketVersioning",
              "s3:GetBucketLocation",
              "s3:GetObjectVersion",
            ]),
            Resource: [
              "arn:aws:s3:::nj-bfs-all-accounts-config-files/*",
              "arn:aws:s3:::nj-bfs-all-accounts-config-files",
            ],
          }),
        );
      });

      test("creates aws-mfa-setup policy", () => {
        devTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "aws-mfa-setup",
          Description: "Policy allowing user to setup an mfa key",
        });

        const policies = devTemplate.findResources("AWS::IAM::ManagedPolicy");
        const mfaPolicy = Object.values(policies).find(
          (resource: any) => resource.Properties?.ManagedPolicyName === "aws-mfa-setup",
        ) as any;

        expect(mfaPolicy).toBeDefined();
        const statements = mfaPolicy.Properties.PolicyDocument.Statement;

        expect(statements).toContainEqual(
          expect.objectContaining({
            Effect: "Allow",
            Action: [
              "iam:EnableMFADevice",
              "iam:CreateVirtualMFADevice",
              "iam:ListVirtualMFADevices",
              "sts:GetSessionToken",
              "iam:ListMFADevices",
            ],
            Resource: "*",
          }),
        );
      });
    });

    describe("Terraform Group and Users", () => {
      test("creates aws-terraform-users group with correct path", () => {
        devTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-terraform-users",
          Path: "/users/",
        });
      });

      test("attaches terraform, config, and mfa policies to terraform group", () => {
        const groups = devTemplate.findResources("AWS::IAM::Group");
        const terraformGroup = Object.values(groups).find(
          (resource: any) => resource.Properties?.GroupName === "aws-terraform-users",
        ) as any;

        expect(terraformGroup).toBeDefined();
        expect(terraformGroup.Properties.ManagedPolicyArns).toBeDefined();
        expect(terraformGroup.Properties.ManagedPolicyArns.length).toBe(3);
      });

      test("creates terraform users from TERRAFORM_USERNAMES environment variable", () => {
        devTemplate.hasResourceProperties("AWS::IAM::User", {
          UserName: "charlie-terraform",
          Path: "/users/",
        });

        devTemplate.hasResourceProperties("AWS::IAM::User", {
          UserName: "dave-terraform",
          Path: "/users/",
        });
      });

      test("creates access keys for each terraform user", () => {
        devTemplate.hasResourceProperties("AWS::IAM::AccessKey", {
          UserName: "charlie-terraform",
        });

        devTemplate.hasResourceProperties("AWS::IAM::AccessKey", {
          UserName: "dave-terraform",
        });
      });

      test("adds terraform users to terraform group", () => {
        const users = devTemplate.findResources("AWS::IAM::User");
        const charlieUser = Object.entries(users).find(
          ([_, resource]: [string, any]) => resource.Properties?.UserName === "charlie-terraform",
        );

        expect(charlieUser).toBeDefined();
        expect(charlieUser![1].Properties.Groups).toBeDefined();
      });
    });

    describe("BFS Admin Group", () => {
      test("creates aws-bfs-users group with system path", () => {
        devTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-bfs-users",
          Path: "/system/",
        });
      });

      test("attaches main deployment policy to bfs group in dev", () => {
        devTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-deployment-policy-for-users",
          Description: "Policy for deploying and running the AWS resources for the BFS app",
        });

        const groups = devTemplate.findResources("AWS::IAM::Group");
        const bfsGroup = Object.values(groups).find(
          (resource: any) => resource.Properties?.GroupName === "aws-bfs-users",
        ) as any;

        expect(bfsGroup).toBeDefined();
        expect(bfsGroup.Properties.ManagedPolicyArns).toBeDefined();
      });

      test("attaches content deployment policy to bfs group in dev", () => {
        devTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-content-deployment-policy-for-users",
          Description: "Policy for deploying the BFS content site",
        });

        const policies = devTemplate.findResources("AWS::IAM::ManagedPolicy");
        const contentPolicy = Object.values(policies).find(
          (resource: any) =>
            resource.Properties?.ManagedPolicyName === "bfs-content-deployment-policy-for-users",
        ) as any;

        expect(contentPolicy).toBeDefined();
        const statements = contentPolicy.Properties.PolicyDocument.Statement;

        expect(statements).toContainEqual(
          expect.objectContaining({
            Effect: "Allow",
            Action: ["ecs:UpdateService"],
            Resource: [process.env.CONTENT_ECS_SERVICE_ARN],
          }),
        );
      });

      test("attaches testing deployment policy to bfs group in dev", () => {
        devTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
          ManagedPolicyName: "bfs-testing-deployment-policy-for-users",
          Description: "Policy for deploying the BFS testing site",
        });

        const policies = devTemplate.findResources("AWS::IAM::ManagedPolicy");
        const testingPolicy = Object.values(policies).find(
          (resource: any) =>
            resource.Properties?.ManagedPolicyName === "bfs-testing-deployment-policy-for-users",
        ) as any;

        expect(testingPolicy).toBeDefined();
        const statements = testingPolicy.Properties.PolicyDocument.Statement;

        expect(statements).toContainEqual(
          expect.objectContaining({
            Effect: "Allow",
            Action: ["ecs:UpdateService"],
            Resource: [process.env.TESTING_ECS_SERVICE_ARN],
          }),
        );
      });

      test("does not attach deployment policies to bfs group in non-dev environments", () => {
        const stagingApp = new App();
        const stagingStack = new IamStack(stagingApp, "TestIamStackStaging", { stage: "staging" });
        const stagingTemplate = Template.fromStack(stagingStack);

        expect(() => {
          stagingTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
            ManagedPolicyName: "bfs-deployment-policy-for-users",
          });
        }).toThrow();

        expect(() => {
          stagingTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
            ManagedPolicyName: "bfs-content-deployment-policy-for-users",
          });
        }).toThrow();

        expect(() => {
          stagingTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
            ManagedPolicyName: "bfs-testing-deployment-policy-for-users",
          });
        }).toThrow();
      });
    });

    describe("Environment-Specific User Creation", () => {
      test("does not create users in content environment", () => {
        const contentApp = new App();
        const contentStack = new IamStack(contentApp, "TestIamStackContent", { stage: "content" });
        const contentTemplate = Template.fromStack(contentStack);

        expect(() => {
          contentTemplate.hasResourceProperties("AWS::IAM::User", {
            UserName: "bfs-navigator",
          });
        }).toThrow();

        expect(() => {
          contentTemplate.hasResourceProperties("AWS::IAM::Group", {
            GroupName: "bfs-navigator-developers",
          });
        }).toThrow();

        expect(() => {
          contentTemplate.hasResourceProperties("AWS::IAM::Group", {
            GroupName: "aws-terraform-users",
          });
        }).toThrow();

        expect(() => {
          contentTemplate.hasResourceProperties("AWS::IAM::Group", {
            GroupName: "aws-bfs-users",
          });
        }).toThrow();
      });

      test("does not create users in testing environment", () => {
        const testingApp = new App();
        const testingStack = new IamStack(testingApp, "TestIamStackTesting", { stage: "testing" });
        const testingTemplate = Template.fromStack(testingStack);

        expect(() => {
          testingTemplate.hasResourceProperties("AWS::IAM::User", {
            UserName: "bfs-navigator",
          });
        }).toThrow();

        expect(() => {
          testingTemplate.hasResourceProperties("AWS::IAM::Group", {
            GroupName: "bfs-navigator-developers",
          });
        }).toThrow();
      });

      test("creates users in staging environment", () => {
        // Staging needs SSM/KMS env vars for policies but not dev-only resources
        process.env.SSM_PARAMETER_ARNS =
          "arn:aws:ssm:us-east-1:123456789012:parameter/test1,arn:aws:ssm:us-east-1:123456789012:parameter/test2";
        process.env.KMS_KEY_ARNS =
          "arn:aws:kms:us-east-1:123456789012:key/test-key-1,arn:aws:kms:us-east-1:123456789012:key/test-key-2";

        const stagingApp = new App();
        const stagingStack = new IamStack(stagingApp, "TestIamStackStaging", { stage: "staging" });
        const stagingTemplate = Template.fromStack(stagingStack);

        stagingTemplate.hasResourceProperties("AWS::IAM::User", {
          UserName: "bfs-navigator",
          Path: "/system/",
        });

        stagingTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-terraform-users",
          Path: "/users/",
        });

        stagingTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-bfs-users",
          Path: "/system/",
        });
      });

      test("creates users in prod environment", () => {
        // Prod needs SSM/KMS env vars for policies but not dev-only resources
        process.env.SSM_PARAMETER_ARNS =
          "arn:aws:ssm:us-east-1:123456789012:parameter/test1,arn:aws:ssm:us-east-1:123456789012:parameter/test2";
        process.env.KMS_KEY_ARNS =
          "arn:aws:kms:us-east-1:123456789012:key/test-key-1,arn:aws:kms:us-east-1:123456789012:key/test-key-2";

        const prodApp = new App();
        const prodStack = new IamStack(prodApp, "TestIamStackProd", { stage: "prod" });
        const prodTemplate = Template.fromStack(prodStack);

        prodTemplate.hasResourceProperties("AWS::IAM::User", {
          UserName: "bfs-navigator",
          Path: "/system/",
        });

        prodTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-terraform-users",
          Path: "/users/",
        });

        prodTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-bfs-users",
          Path: "/system/",
        });
      });
    });

    describe("Missing Environment Variables", () => {
      test("does not create dev users when DEV_USERNAMES is not set", () => {
        delete process.env.DEV_USERNAMES;

        const noUsernamesApp = new App();
        const noUsernamesStack = new IamStack(noUsernamesApp, "TestIamStackNoUsernames", {
          stage: "dev",
        });
        const noUsernamesTemplate = Template.fromStack(noUsernamesStack);

        expect(() => {
          noUsernamesTemplate.hasResourceProperties("AWS::IAM::User", {
            UserName: "alice-cli-access",
          });
        }).toThrow();

        expect(() => {
          noUsernamesTemplate.hasResourceProperties("AWS::IAM::User", {
            UserName: "bob-cli-access",
          });
        }).toThrow();
      });

      test("does not create terraform users when TERRAFORM_USERNAMES is not set", () => {
        delete process.env.TERRAFORM_USERNAMES;

        const noTerraformApp = new App();
        const noTerraformStack = new IamStack(noTerraformApp, "TestIamStackNoTerraform", {
          stage: "dev",
        });
        const noTerraformTemplate = Template.fromStack(noTerraformStack);

        expect(() => {
          noTerraformTemplate.hasResourceProperties("AWS::IAM::User", {
            UserName: "charlie-terraform",
          });
        }).toThrow();

        expect(() => {
          noTerraformTemplate.hasResourceProperties("AWS::IAM::User", {
            UserName: "dave-terraform",
          });
        }).toThrow();
      });

      test("does not create dev policies when SSM_PARAMETER_ARNS is not set", () => {
        delete process.env.SSM_PARAMETER_ARNS;

        const noSsmApp = new App();
        const noSsmStack = new IamStack(noSsmApp, "TestIamStackNoSsm", { stage: "dev" });
        const noSsmTemplate = Template.fromStack(noSsmStack);

        expect(() => {
          noSsmTemplate.hasResourceProperties("AWS::IAM::ManagedPolicy", {
            ManagedPolicyName: "bfs-navigator-dev-policy",
          });
        }).toThrow();
      });

      test("does not create local policy when LOCAL_S3_BUCKET_NAME is not set", () => {
        delete process.env.LOCAL_S3_BUCKET_NAME;

        const noS3App = new App();
        const noS3Stack = new IamStack(noS3App, "TestIamStackNoS3", { stage: "dev" });
        const noS3Template = Template.fromStack(noS3Stack);

        expect(() => {
          noS3Template.hasResourceProperties("AWS::IAM::ManagedPolicy", {
            ManagedPolicyName: "bfs-navigator-local-policy",
          });
        }).toThrow();
      });
    });
  });
});

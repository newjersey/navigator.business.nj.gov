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

  describe("IAM Groups", () => {
    test("creates developer group in dev stage", () => {
      const devApp = new App();
      const devProps: IamStackProps = { stage: "dev" };
      const devStack = new IamStack(devApp, "TestIamStackDevGroup", devProps);
      const devTemplate = Template.fromStack(devStack);

      expect(() => {
        devTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "bfs-navigator-developers",
          Path: "/users/",
        });
      }).not.toThrow();
    });

    test("creates developer group in staging stage", () => {
      const stagingApp = new App();
      const stagingProps: IamStackProps = { stage: "staging" };
      const stagingStack = new IamStack(stagingApp, "TestIamStackStagingGroup", stagingProps);
      const stagingTemplate = Template.fromStack(stagingStack);

      expect(() => {
        stagingTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "bfs-navigator-developers",
          Path: "/users/",
        });
      }).not.toThrow();
    });

    test("creates developer group in prod stage", () => {
      const prodApp = new App();
      const prodProps: IamStackProps = { stage: "prod" };
      const prodStack = new IamStack(prodApp, "TestIamStackProdGroup", prodProps);
      const prodTemplate = Template.fromStack(prodStack);

      expect(() => {
        prodTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "bfs-navigator-developers",
          Path: "/users/",
        });
      }).not.toThrow();
    });

    test("does NOT create developer group in content stage", () => {
      const contentApp = new App();
      const contentProps: IamStackProps = { stage: "content" };
      const contentStack = new IamStack(contentApp, "TestIamStackContentGroup", contentProps);
      const contentTemplate = Template.fromStack(contentStack);

      expect(() => {
        contentTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "bfs-navigator-developers",
        });
      }).toThrow();
    });

    test("does NOT create developer group in testing stage", () => {
      const testingApp = new App();
      const testingProps: IamStackProps = { stage: "testing" };
      const testingStack = new IamStack(testingApp, "TestIamStackTestingGroup", testingProps);
      const testingTemplate = Template.fromStack(testingStack);

      expect(() => {
        testingTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "bfs-navigator-developers",
        });
      }).toThrow();
    });

    test("creates developer group in local stage", () => {
      const localApp = new App();
      const localProps: IamStackProps = { stage: "local" };
      const localStack = new IamStack(localApp, "TestIamStackLocalGroup", localProps);
      const localTemplate = Template.fromStack(localStack);

      expect(() => {
        localTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "bfs-navigator-developers",
          Path: "/users/",
        });
      }).not.toThrow();
    });

    test("creates bfs-users group in dev stage", () => {
      const devApp = new App();
      const devProps: IamStackProps = { stage: "dev" };
      const devStack = new IamStack(devApp, "TestIamStackDevBfsGroup", devProps);
      const devTemplate = Template.fromStack(devStack);

      expect(() => {
        devTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-bfs-users",
          Path: "/system/",
        });
      }).not.toThrow();
    });

    test("creates bfs-users group in staging stage", () => {
      const stagingApp = new App();
      const stagingProps: IamStackProps = { stage: "staging" };
      const stagingStack = new IamStack(stagingApp, "TestIamStackStagingBfsGroup", stagingProps);
      const stagingTemplate = Template.fromStack(stagingStack);

      expect(() => {
        stagingTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-bfs-users",
          Path: "/system/",
        });
      }).not.toThrow();
    });

    test("creates bfs-users group in prod stage", () => {
      const prodApp = new App();
      const prodProps: IamStackProps = { stage: "prod" };
      const prodStack = new IamStack(prodApp, "TestIamStackProdBfsGroup", prodProps);
      const prodTemplate = Template.fromStack(prodStack);

      expect(() => {
        prodTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-bfs-users",
          Path: "/system/",
        });
      }).not.toThrow();
    });

    test("does NOT create bfs-users group in content stage", () => {
      const contentApp = new App();
      const contentProps: IamStackProps = { stage: "content" };
      const contentStack = new IamStack(contentApp, "TestIamStackContentBfsGroup", contentProps);
      const contentTemplate = Template.fromStack(contentStack);

      expect(() => {
        contentTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-bfs-users",
        });
      }).toThrow();
    });

    test("does NOT create bfs-users group in testing stage", () => {
      const testingApp = new App();
      const testingProps: IamStackProps = { stage: "testing" };
      const testingStack = new IamStack(testingApp, "TestIamStackTestingBfsGroup", testingProps);
      const testingTemplate = Template.fromStack(testingStack);

      expect(() => {
        testingTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-bfs-users",
        });
      }).toThrow();
    });

    test("creates bfs-users group in local stage", () => {
      const localApp = new App();
      const localProps: IamStackProps = { stage: "local" };
      const localStack = new IamStack(localApp, "TestIamStackLocalBfsGroup", localProps);
      const localTemplate = Template.fromStack(localStack);

      expect(() => {
        localTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-bfs-users",
          Path: "/system/",
        });
      }).not.toThrow();
    });

    test("creates both groups together when not in content or testing", () => {
      const devApp = new App();
      const devProps: IamStackProps = { stage: "dev" };
      const devStack = new IamStack(devApp, "TestIamStackBothGroups", devProps);
      const devTemplate = Template.fromStack(devStack);

      const groups = devTemplate.findResources("AWS::IAM::Group");
      const groupNames = Object.values(groups).map(
        (group) => group.Properties?.GroupName as string,
      );

      expect(groupNames).toContain("bfs-navigator-developers");
      expect(groupNames).toContain("aws-bfs-users");
    });

    test("developer group has correct path", () => {
      const devApp = new App();
      const devProps: IamStackProps = { stage: "dev" };
      const devStack = new IamStack(devApp, "TestIamStackDevPath", devProps);
      const devTemplate = Template.fromStack(devStack);

      expect(() => {
        devTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "bfs-navigator-developers",
          Path: "/users/",
        });
      }).not.toThrow();
    });

    test("bfs-users group has correct path", () => {
      const devApp = new App();
      const devProps: IamStackProps = { stage: "dev" };
      const devStack = new IamStack(devApp, "TestIamStackBfsPath", devProps);
      const devTemplate = Template.fromStack(devStack);

      expect(() => {
        devTemplate.hasResourceProperties("AWS::IAM::Group", {
          GroupName: "aws-bfs-users",
          Path: "/system/",
        });
      }).not.toThrow();
    });

    test("groups are accessible via stack properties", () => {
      const devApp = new App();
      const devProps: IamStackProps = { stage: "dev" };
      const devStack = new IamStack(devApp, "TestIamStackProperties", devProps);

      expect(devStack.developerGroup).toBeDefined();
      expect(devStack.bfsUsersGroup).toBeDefined();
    });

    test("groups are undefined when stage is content", () => {
      const contentApp = new App();
      const contentProps: IamStackProps = { stage: "content" };
      const contentStack = new IamStack(contentApp, "TestIamStackContentProps", contentProps);

      expect(contentStack.developerGroup).toBeUndefined();
      expect(contentStack.bfsUsersGroup).toBeUndefined();
    });

    test("groups are undefined when stage is testing", () => {
      const testingApp = new App();
      const testingProps: IamStackProps = { stage: "testing" };
      const testingStack = new IamStack(testingApp, "TestIamStackTestingProps", testingProps);

      expect(testingStack.developerGroup).toBeUndefined();
      expect(testingStack.bfsUsersGroup).toBeUndefined();
    });

    test("creates exactly 2 groups in dev stage", () => {
      const devApp = new App();
      const devProps: IamStackProps = { stage: "dev" };
      const devStack = new IamStack(devApp, "TestIamStackGroupCount", devProps);
      const devTemplate = Template.fromStack(devStack);

      const groups = devTemplate.findResources("AWS::IAM::Group");
      expect(Object.keys(groups).length).toBe(2);
    });

    test("creates no groups in content stage", () => {
      const contentApp = new App();
      const contentProps: IamStackProps = { stage: "content" };
      const contentStack = new IamStack(contentApp, "TestIamStackNoGroups", contentProps);
      const contentTemplate = Template.fromStack(contentStack);

      const groups = contentTemplate.findResources("AWS::IAM::Group");
      expect(Object.keys(groups).length).toBe(0);
    });

    test("developer group has correct properties in dev stage", () => {
      const devApp = new App();
      const devProps: IamStackProps = { stage: "dev" };
      const devStack = new IamStack(devApp, "TestIamStackDevGroupProps", devProps);
      const devTemplate = Template.fromStack(devStack);

      const groups = devTemplate.findResources("AWS::IAM::Group");
      const devGroup = Object.values(groups).find(
        (group) => group.Properties?.GroupName === "bfs-navigator-developers",
      );

      expect(devGroup).toBeDefined();
      expect(devGroup?.Properties?.Path).toBe("/users/");
    });

    test("bfs-users group has correct properties in dev stage", () => {
      const devApp = new App();
      const devProps: IamStackProps = { stage: "dev" };
      const devStack = new IamStack(devApp, "TestIamStackBfsGroupProps", devProps);
      const devTemplate = Template.fromStack(devStack);

      const groups = devTemplate.findResources("AWS::IAM::Group");
      const bfsGroup = Object.values(groups).find(
        (group) => group.Properties?.GroupName === "aws-bfs-users",
      );

      expect(bfsGroup).toBeDefined();
      expect(bfsGroup?.Properties?.Path).toBe("/system/");
    });
  });
});

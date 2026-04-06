import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { IamStack } from "../lib/iamStack";

describe("IamStack Simple Test", () => {
  test("creates IAM users when environment variables are set", () => {
    // Set environment variables
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

    const app = new App();
    const stack = new IamStack(app, "TestSimpleStack", {
      stage: "dev",
      env: { account: "123456789012", region: "us-east-1" },
    });
    const template = Template.fromStack(stack);

    const allResources = template.toJSON().Resources;
    console.log("All resource types:", Object.entries(allResources).map(([id, r]: [string, any]) => `${id}: ${r.Type}`));

    const users = Object.entries(allResources).filter(([_, r]: [string, any]) => r.Type === "AWS::IAM::User");
    const groups = Object.entries(allResources).filter(([_, r]: [string, any]) => r.Type === "AWS::IAM::Group");
    const policies = Object.entries(allResources).filter(([_, r]: [string, any]) => r.Type === "AWS::IAM::ManagedPolicy");

    console.log(`Found ${users.length} users, ${groups.length} groups, ${policies.length} policies`);

    expect(users.length).toBeGreaterThan(0);
    expect(groups.length).toBeGreaterThan(0);
    expect(policies.length).toBeGreaterThan(0);
  });
});

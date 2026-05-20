import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { StaticSiteRepositoryStack } from "../lib/staticSiteRepositoryStack";

describe("StaticSiteRepositoryStack", () => {
  test("has no CloudFormation Outputs to prevent cross-stack export dependencies", () => {
    const app = new App();
    const stack = new StaticSiteRepositoryStack(app, "TestStaticSiteRepositoryStack", {});
    const template = Template.fromStack(stack);

    expect(template.toJSON().Outputs).toBeUndefined();
  });

  test("creates a private shared ECR repository that keeps recent tagged images", () => {
    const app = new App();
    const stack = new StaticSiteRepositoryStack(app, "TestStaticSiteRepositoryStack", {});
    const template = Template.fromStack(stack);

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ECR::Repository", {
      RepositoryName: "bfs-static-site",
      ImageScanningConfiguration: {
        ScanOnPush: true,
      },
      LifecyclePolicy: {
        LifecyclePolicyText: Match.serializedJson(
          Match.objectLike({
            rules: Match.arrayWith([
              Match.objectLike({
                selection: Match.objectLike({
                  tagStatus: "untagged",
                  countType: "sinceImagePushed",
                  countNumber: 7,
                  countUnit: "days",
                }),
              }),
              Match.objectLike({
                selection: Match.objectLike({
                  tagStatus: "tagged",
                  tagPatternList: ["*"],
                  countType: "imageCountMoreThan",
                  countNumber: 100,
                }),
              }),
            ]),
          }),
        ),
      },
      Tags: Match.arrayWith([{ Key: "STAGE", Value: "shared" }]),
    });
  });
});

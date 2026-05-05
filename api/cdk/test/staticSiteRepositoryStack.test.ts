import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { StaticSiteRepositoryStack } from "../lib/staticSiteRepositoryStack";

describe("StaticSiteRepositoryStack", () => {
  test("creates a private dev ECR repository that keeps the latest 50 tagged images", () => {
    const app = new App();
    const stack = new StaticSiteRepositoryStack(app, "TestStaticSiteRepositoryStack", {
      stage: "dev",
    });
    const template = Template.fromStack(stack);

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ECR::Repository", {
      RepositoryName: "bfs-static-site-dev",
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
                  countNumber: 50,
                }),
              }),
            ]),
          }),
        ),
      },
      Tags: Match.arrayWith([{ Key: "STAGE", Value: "dev" }]),
    });
  });

  test("creates a private prod ECR repository that keeps the latest 20 tagged images", () => {
    const app = new App();
    const stack = new StaticSiteRepositoryStack(app, "TestStaticSiteRepositoryStackProd", {
      stage: "prod",
    });
    const template = Template.fromStack(stack);

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ECR::Repository", {
      RepositoryName: "bfs-static-site-prod",
      LifecyclePolicy: {
        LifecyclePolicyText: Match.serializedJson(
          Match.objectLike({
            rules: Match.arrayWith([
              Match.objectLike({
                selection: Match.objectLike({
                  tagStatus: "tagged",
                  tagPatternList: ["*"],
                  countType: "imageCountMoreThan",
                  countNumber: 20,
                }),
              }),
            ]),
          }),
        ),
      },
      Tags: Match.arrayWith([{ Key: "STAGE", Value: "prod" }]),
    });
  });
});

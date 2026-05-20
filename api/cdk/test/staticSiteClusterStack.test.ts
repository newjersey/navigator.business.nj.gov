import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { StaticSiteClusterStack } from "../lib/staticSiteClusterStack";

describe("StaticSiteClusterStack", () => {
  test("creates the shared static-site ECS cluster", () => {
    const app = new App();
    const stack = new StaticSiteClusterStack(app, "TestStaticSiteClusterStack", {});
    const template = Template.fromStack(stack);

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ECS::Cluster", {
      ClusterName: "bfs-static-site",
      ClusterSettings: Match.arrayWith([
        {
          Name: "containerInsights",
          Value: "enabled",
        },
      ]),
      Tags: Match.arrayWith([{ Key: "STAGE", Value: "shared" }]),
    });
  });

  test("does not create networking resources", () => {
    const app = new App();
    const stack = new StaticSiteClusterStack(app, "TestStaticSiteClusterStack", {});
    const template = Template.fromStack(stack);

    expect(template.toJSON()).toBeDefined();
    template.resourceCountIs("AWS::EC2::VPC", 0);
    template.resourceCountIs("AWS::EC2::InternetGateway", 0);
    template.resourceCountIs("AWS::EC2::Subnet", 0);
  });
});

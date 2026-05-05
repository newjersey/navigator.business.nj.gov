import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { StaticSiteServiceStack } from "../lib/staticSiteServiceStack";

const createStaticSiteTemplate = (stage: string): Template => {
  const app = new App();
  const repositoryStack = new Stack(app, `${stage}RepositoryStack`);
  const repository = new ecr.Repository(repositoryStack, "StaticSiteRepository", {
    repositoryName: `bfs-static-site-${stage}`,
  });
  const stack = new StaticSiteServiceStack(app, `${stage}StaticSiteServiceStack`, {
    stage,
    repository,
    imageTag: "abc123",
  });

  return Template.fromStack(stack);
};

describe("StaticSiteServiceStack", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    process.env.BASIC_AUTH_PASSWORD = "test-password";
    process.env.BASIC_AUTH_USERNAME = "test-user";
    process.env.VPC_ID = "vpc-1234567890abcdef0";
    process.env.SUBNET_ID_01 = "subnet-11111111111111111";
    process.env.SUBNET_ID_02 = "subnet-22222222222222222";
    process.env.SG_ID = "sg-1234567890abcdef0";
  });

  afterEach(() => {
    process.env = { ...originalEnvironment };
  });

  test("creates an internal ALB-backed Fargate service for the static site", () => {
    const template = createStaticSiteTemplate("dev");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::LoadBalancer", {
      Name: "bfs-static-site-dev-alb",
      Scheme: "internal",
      Type: "application",
      LoadBalancerAttributes: Match.arrayWith([
        { Key: "deletion_protection.enabled", Value: "true" },
      ]),
    });
    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::TargetGroup", {
      Name: "bfs-static-site-dev-tg",
      HealthCheckPath: "/healthz",
      Matcher: { HttpCode: "200" },
      Port: 80,
      Protocol: "HTTP",
      TargetType: "ip",
    });
    template.hasResourceProperties("AWS::ECS::TaskDefinition", {
      Family: "bfs-static-site-dev",
      Cpu: "512",
      Memory: "1024",
      ContainerDefinitions: Match.arrayWith([
        Match.objectLike({
          Name: "static-site",
          Essential: true,
          HealthCheck: Match.objectLike({
            Command: Match.arrayWith(["CMD-SHELL", Match.stringLikeRegexp("/healthz")]),
          }),
          PortMappings: Match.arrayWith([
            Match.objectLike({
              ContainerPort: 3000,
              HostPort: 3000,
              Protocol: "tcp",
            }),
          ]),
        }),
      ]),
    });
    template.hasResourceProperties("AWS::ECS::Service", {
      ServiceName: "bfs-static-site-dev",
      DesiredCount: 1,
      LaunchType: "FARGATE",
      DeploymentConfiguration: Match.objectLike({
        MaximumPercent: 200,
        MinimumHealthyPercent: 0,
      }),
    });
  });

  test("injects Basic Auth runtime settings for non-production static-site tasks", () => {
    const template = createStaticSiteTemplate("dev");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ECS::TaskDefinition", {
      ContainerDefinitions: Match.arrayWith([
        Match.objectLike({
          Environment: Match.arrayWith([
            { Name: "USE_BASIC_AUTH", Value: "true" },
            { Name: "BASIC_AUTH_USERNAME", Value: "test-user" },
            { Name: "BASIC_AUTH_PASSWORD", Value: "test-password" },
          ]),
        }),
      ]),
    });
  });

  test("requires Basic Auth credentials for non-production static-site tasks", () => {
    delete process.env.BASIC_AUTH_PASSWORD;

    expect(() => createStaticSiteTemplate("dev")).toThrow(
      "BASIC_AUTH_PASSWORD is required to deploy Basic Auth for the static-site ECS service.",
    );
  });

  test("disables Basic Auth runtime settings for production static-site tasks", () => {
    const template = createStaticSiteTemplate("prod");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ECS::TaskDefinition", {
      ContainerDefinitions: Match.arrayWith([
        Match.objectLike({
          Environment: Match.arrayWith([{ Name: "USE_BASIC_AUTH", Value: "false" }]),
        }),
      ]),
    });
    template.hasResourceProperties("AWS::ECS::TaskDefinition", {
      ContainerDefinitions: Match.arrayWith([
        Match.not(
          Match.objectLike({
            Environment: Match.arrayWith([Match.objectLike({ Name: "BASIC_AUTH_PASSWORD" })]),
          }),
        ),
      ]),
    });
  });

  test("creates a static-site log group with six-month retention", () => {
    const template = createStaticSiteTemplate("dev");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::Logs::LogGroup", {
      LogGroupName: "/ecs/bfs-static-site/dev",
      RetentionInDays: 180,
      Tags: Match.arrayWith([{ Key: "STAGE", Value: "dev" }]),
    });
  });

  test("creates CloudWatch alarms with expected thresholds and periods", () => {
    const template = createStaticSiteTemplate("dev");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::CloudWatch::Alarm", {
      AlarmName: "dev-bfs-static-site-unhealthy-targets",
      MetricName: "UnHealthyHostCount",
      Namespace: "AWS/ApplicationELB",
      Period: 300,
      Statistic: "Average",
      Threshold: 1,
      TreatMissingData: "notBreaching",
    });
    template.hasResourceProperties("AWS::CloudWatch::Alarm", {
      AlarmName: "dev-bfs-static-site-target-5xx",
      MetricName: "HTTPCode_Target_5XX_Count",
      Namespace: "AWS/ApplicationELB",
      Period: 300,
      Statistic: "Sum",
      Threshold: 1,
      TreatMissingData: "notBreaching",
    });
    template.hasResourceProperties("AWS::CloudWatch::Alarm", {
      AlarmName: "dev-bfs-static-site-running-task-count",
      MetricName: "RunningTaskCount",
      Namespace: "ECS/ContainerInsights",
      Period: 300,
      Statistic: "Average",
      Threshold: 1,
      TreatMissingData: "breaching",
    });
    template.hasResourceProperties("AWS::Events::Rule", {
      Name: "dev-bfs-static-site-deployment-failures",
    });
  });

  test("exports the stage-specific hostname for Terraform and WAF origin wiring", () => {
    const template = createStaticSiteTemplate("prod");

    expect(template.toJSON()).toBeDefined();
    template.hasOutput("StaticSiteHostname", {
      Value: "next.business.nj.gov",
      Export: {
        Name: "bfs-static-site-prod-hostname",
      },
    });
  });

  test("creates an SNS topic and Chatbot subscription for static-site alerts", () => {
    const template = createStaticSiteTemplate("dev");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::SNS::Topic", {
      TopicName: "bfs-static-site-errors-dev",
      Tags: Match.arrayWith([{ Key: "STAGE", Value: "dev" }]),
    });
    template.hasResourceProperties("AWS::SNS::Subscription", {
      Endpoint: "https://global.sns-api.chatbot.amazonaws.com",
      Protocol: "https",
    });
  });
});

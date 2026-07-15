import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { STATIC_SITE_CERTIFICATE_IDS_BY_STAGE } from "../lib/constants";
import { StaticSiteServiceStack } from "../lib/staticSiteServiceStack";

const TEST_AWS_ACCOUNT_ID = "123456789012";
const TEST_AWS_REGION = "us-east-1";
const STATIC_SITE_TEST_ENVIRONMENT = {
  account: TEST_AWS_ACCOUNT_ID,
  region: TEST_AWS_REGION,
};
const createStaticSiteCertificateArn = (stage: string) => {
  return {
    "Fn::Join": [
      "",
      [
        "arn:",
        { Ref: "AWS::Partition" },
        `:acm:${TEST_AWS_REGION}:${TEST_AWS_ACCOUNT_ID}:certificate/${STATIC_SITE_CERTIFICATE_IDS_BY_STAGE[stage]}`,
      ],
    ],
  };
};

const createStaticSiteTemplates = (stage: string) => {
  const app = new App();
  const serviceStack = new StaticSiteServiceStack(app, `${stage}StaticSiteServiceStack`, {
    stage,
    env: STATIC_SITE_TEST_ENVIRONMENT,
  });

  return {
    serviceTemplate: Template.fromStack(serviceStack),
  };
};

const createStaticSiteTemplate = (stage: string): Template => {
  return createStaticSiteTemplates(stage).serviceTemplate;
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

  test("creates an internal HTTPS ALB-backed Fargate service for the static site", () => {
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
    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::Listener", {
      Port: 443,
      Protocol: "HTTPS",
      Certificates: [{ CertificateArn: createStaticSiteCertificateArn("dev") }],
      SslPolicy: "ELBSecurityPolicy-TLS13-1-2-2021-06",
    });
    template.hasResourceProperties("AWS::EC2::SecurityGroupIngress", {
      GroupId: "sg-1234567890abcdef0",
      IpProtocol: "tcp",
      FromPort: 80,
      ToPort: 80,
      CidrIp: "0.0.0.0/0",
      Description: "Allow HTTP traffic to the static-site load balancer.",
    });
    template.hasResourceProperties("AWS::EC2::SecurityGroupIngress", {
      GroupId: "sg-1234567890abcdef0",
      IpProtocol: "tcp",
      FromPort: 443,
      ToPort: 443,
      CidrIp: "0.0.0.0/0",
      Description: "Allow HTTPS traffic to the static-site load balancer.",
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
      RuntimePlatform: {
        CpuArchitecture: "X86_64",
        OperatingSystemFamily: "LINUX",
      },
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
      Cluster: "bfs-static-site",
      DesiredCount: 1,
      LaunchType: "FARGATE",
      DeploymentConfiguration: Match.objectLike({
        MaximumPercent: 200,
        MinimumHealthyPercent: 0,
      }),
    });
  });

  test.each(["dev", "content", "testing", "staging"])(
    "injects Basic Auth runtime settings for the protected %s static-site task",
    (stage) => {
      const template = createStaticSiteTemplate(stage);

      expect(template.toJSON()).toBeDefined();
      template.hasResourceProperties("AWS::ECS::TaskDefinition", {
        ContainerDefinitions: Match.arrayWith([
          Match.objectLike({
            Environment: Match.arrayEquals([
              { Name: "HOSTNAME", Value: "0.0.0.0" },
              { Name: "NODE_ENV", Value: "production" },
              { Name: "PORT", Value: "3000" },
              { Name: "NEXT_PUBLIC_SURVEY_MONKEY_ENABLED", Value: "false" },
              { Name: "USE_BASIC_AUTH", Value: "true" },
              { Name: "BASIC_AUTH_USERNAME", Value: "test-user" },
              { Name: "BASIC_AUTH_PASSWORD", Value: "test-password" },
            ]),
          }),
        ]),
      });
    },
  );

  test("uses the staging account static-site certificate for staging", () => {
    const template = createStaticSiteTemplate("staging");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::Listener", {
      Certificates: [{ CertificateArn: createStaticSiteCertificateArn("staging") }],
    });
  });

  test("uses the production account static-site certificate for production", () => {
    const template = createStaticSiteTemplate("prod");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::Listener", {
      Certificates: [{ CertificateArn: createStaticSiteCertificateArn("prod") }],
    });
  });

  test("requires Basic Auth credentials for protected static-site tasks", () => {
    delete process.env.BASIC_AUTH_PASSWORD;

    expect(() => createStaticSiteTemplate("dev")).toThrow(
      "BASIC_AUTH_PASSWORD is required to deploy Basic Auth for the static-site ECS service.",
    );
  });

  test("disables Basic Auth for production static-site tasks and omits credentials", () => {
    const template = createStaticSiteTemplate("prod");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ECS::TaskDefinition", {
      ContainerDefinitions: Match.arrayWith([
        Match.objectLike({
          Environment: Match.arrayEquals([
            { Name: "HOSTNAME", Value: "0.0.0.0" },
            { Name: "NODE_ENV", Value: "production" },
            { Name: "PORT", Value: "3000" },
            { Name: "NEXT_PUBLIC_SURVEY_MONKEY_ENABLED", Value: "true" },
            { Name: "USE_BASIC_AUTH", Value: "false" },
          ]),
        }),
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

  test("does not create per-stage ECS clusters", () => {
    const template = createStaticSiteTemplate("dev");

    expect(template.toJSON()).toBeDefined();
    template.resourceCountIs("AWS::ECS::Cluster", 0);
    template.hasResourceProperties("AWS::ECS::Service", {
      Cluster: "bfs-static-site",
    });
  });

  test("references the shared ECR repository by name without a cross-stack Fn::ImportValue", () => {
    const template = createStaticSiteTemplate("dev");
    const templateJson = JSON.stringify(template.toJSON());

    expect(templateJson).not.toContain("Fn::ImportValue");
    template.hasResourceProperties("AWS::ECS::TaskDefinition", {
      ContainerDefinitions: Match.arrayWith([
        Match.objectLike({
          Image: {
            "Fn::Join": [
              "",
              [
                "123456789012.dkr.ecr.us-east-1.",
                { Ref: "AWS::URLSuffix" },
                "/bfs-static-site:bfs-static-site-dev",
              ],
            ],
          },
        }),
      ]),
    });
  });

  test("uses the immutable image tag pushed by the static-site deploy workflow", () => {
    process.env.STATIC_SITE_IMAGE_VERSION = "test-image-version";
    const template = createStaticSiteTemplate("dev");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ECS::TaskDefinition", {
      ContainerDefinitions: Match.arrayWith([
        Match.objectLike({
          Image: {
            "Fn::Join": [
              "",
              [
                "123456789012.dkr.ecr.us-east-1.",
                { Ref: "AWS::URLSuffix" },
                "/bfs-static-site:bfs-static-site-dev-test-image-version",
              ],
            ],
          },
        }),
      ]),
    });
  });
});

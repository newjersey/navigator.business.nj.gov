import { API_SERVICE_NAME } from "@businessnjgovnavigator/api/src/libs/constants";
import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { ApiStack } from "../lib/apiStack";

const TEST_AWS_ACCOUNT_ID = "123456789012";
const TEST_AWS_REGION = "us-east-1";
const TEST_API_STACK_ENVIRONMENT = {
  account: TEST_AWS_ACCOUNT_ID,
  region: TEST_AWS_REGION,
};
const TEST_API_GATEWAY_CERT_ARN = `arn:aws:acm:${TEST_AWS_REGION}:${TEST_AWS_ACCOUNT_ID}:certificate/test-certificate-id`;

interface TestApiStackTemplate {
  /** Synthesized CloudFormation template for the API stack under test. */
  readonly template: Template;
}

interface CreateTestLambdaRoleProps {
  /** Stack that owns the Lambda role. */
  readonly stack: Stack;
}

interface CreateImportedLambdaProps {
  /** Stack that owns the imported Lambda reference. */
  readonly stack: Stack;

  /** Construct identifier and Lambda function name suffix. */
  readonly id: string;
}

const createTestLambdaRole = (props: CreateTestLambdaRoleProps): iam.Role => {
  return new iam.Role(props.stack, "ApiStackTestLambdaRole", {
    assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
  });
};

const createImportedLambda = (props: CreateImportedLambdaProps): lambda.IFunction => {
  return lambda.Function.fromFunctionArn(
    props.stack,
    props.id,
    `arn:aws:lambda:${TEST_AWS_REGION}:${TEST_AWS_ACCOUNT_ID}:function:${props.id}`,
  );
};

const createApiStackTemplate = (stage: string): TestApiStackTemplate => {
  const app = new App();
  const dependencyStack = new Stack(app, `${stage}ApiStackDependencies`, {
    env: TEST_API_STACK_ENVIRONMENT,
  });
  const stack = new ApiStack(app, `${stage}ApiStack`, {
    stage,
    env: TEST_API_STACK_ENVIRONMENT,
    lambdaRole: createTestLambdaRole({ stack: dependencyStack }),
    lambdas: {
      express: { lambda: createImportedLambda({ stack: dependencyStack, id: "ExpressLambda" }) },
      githubOauth2: {
        lambda: createImportedLambda({ stack: dependencyStack, id: "GithubOauth2Lambda" }),
      },
    },
  });

  return {
    template: Template.fromStack(stack),
  };
};

describe("ApiStack", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    process.env.API_GATEWAY_CERT_ARN = TEST_API_GATEWAY_CERT_ARN;
    process.env.COGNITO_USER_POOL_ID = "us-east-1_test-user-pool";
    process.env.SG_ID = "sg-1234567890abcdef0";
    process.env.SUBNET_ID_01 = "subnet-11111111111111111";
    process.env.SUBNET_ID_02 = "subnet-22222222222222222";
    process.env.VPC_ID = "vpc-1234567890abcdef0";
  });

  afterEach(() => {
    process.env = { ...originalEnvironment };
  });

  test("creates a REST API without HTTP API resources", () => {
    const { template } = createApiStackTemplate("dev");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: `${API_SERVICE_NAME}-dev`,
    });
    template.resourceCountIs("AWS::ApiGatewayV2::Api", 0);
    template.resourceCountIs("AWS::ApiGatewayV2::Stage", 0);
  });

  test("creates an internal HTTPS API load balancer", () => {
    const { template } = createApiStackTemplate("dev");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::LoadBalancer", {
      Name: `${API_SERVICE_NAME}-dev-alb`,
      Scheme: "internal",
      Type: "application",
      LoadBalancerAttributes: Match.arrayWith([
        { Key: "deletion_protection.enabled", Value: "true" },
      ]),
    });
    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::Listener", {
      Port: 443,
      Protocol: "HTTPS",
      Certificates: [{ CertificateArn: TEST_API_GATEWAY_CERT_ARN }],
      SslPolicy: "ELBSecurityPolicy-TLS13-1-2-2021-06",
      DefaultActions: Match.arrayWith([
        Match.objectLike({
          Type: "forward",
          TargetGroupArn: Match.anyValue(),
        }),
      ]),
    });
    template.hasResourceProperties("AWS::EC2::SecurityGroupIngress", {
      GroupId: "sg-1234567890abcdef0",
      IpProtocol: "tcp",
      FromPort: 443,
      ToPort: 443,
      CidrIp: "0.0.0.0/0",
      Description: "Allow HTTPS traffic to the API load balancer.",
    });
    template.hasOutput("ApiLoadBalancerDnsName", {
      Value: Match.anyValue(),
      Export: {
        Name: `${API_SERVICE_NAME}-dev-ApiLoadBalancerDnsName`,
      },
    });
    template.hasOutput("ApiLoadBalancerTargetGroupArn", {
      Value: Match.anyValue(),
      Export: {
        Name: `${API_SERVICE_NAME}-dev-ApiLoadBalancerTargetGroupArn`,
      },
    });
    template.hasOutput("ApiLoadBalancerListenerArn", {
      Value: Match.anyValue(),
      Export: {
        Name: `${API_SERVICE_NAME}-dev-ApiLoadBalancerListenerArn`,
      },
    });
  });

  test("routes the API load balancer to the REST API proxy Lambda target group", () => {
    const { template } = createApiStackTemplate("dev");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::TargetGroup", {
      Name: `${API_SERVICE_NAME}-dev-tg`,
      TargetType: "lambda",
      HealthCheckEnabled: true,
      HealthCheckPath: "/health",
      Targets: Match.arrayWith([
        Match.objectLike({
          Id: Match.anyValue(),
        }),
      ]),
    });
    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: `${API_SERVICE_NAME}-dev-apiGatewayLoadBalancerProxy`,
      Runtime: "nodejs22.x",
      Environment: {
        Variables: Match.objectLike({
          API_GATEWAY_PROXY_BASE_URL: Match.anyValue(),
          STAGE: "dev",
        }),
      },
    });
    template.hasResourceProperties("AWS::Lambda::Permission", {
      Action: "lambda:InvokeFunction",
      Principal: "elasticloadbalancing.amazonaws.com",
    });
  });

  test("does not create an API load balancer for the local API stack", () => {
    const { template } = createApiStackTemplate("local");

    expect(template.toJSON()).toBeDefined();
    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: "LocalApi-local",
    });
    template.resourceCountIs("AWS::ElasticLoadBalancingV2::LoadBalancer", 0);
    template.resourceCountIs("AWS::ElasticLoadBalancingV2::Listener", 0);
    template.resourceCountIs("AWS::ElasticLoadBalancingV2::TargetGroup", 0);
  });
});

import * as cdk from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import * as logs from "aws-cdk-lib/aws-logs";
import { IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { IVpc, ISecurityGroup, ISubnet } from "aws-cdk-lib/aws-ec2";
import { Role } from "aws-cdk-lib/aws-iam";
import { IConstruct } from "constructs";
import path from "node:path";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

/**
 * Apply standard tags to a given resource.
 */
export const applyStandardTags = (resource: IConstruct, stage: string): void => {
  cdk.Tags.of(resource).add("STAGE", stage);
};

/**
 * Interface for creating a Lambda function with standard properties.
 */
export interface LambdaFunctionProps {
  id: string;
  stage: string;
  functionName: string;
  entry: string;
  handler: string;
  runtime?: Runtime;
  vpc?: IVpc;
  role: Role;
  securityGroups?: ISecurityGroup[];
  vpcSubnets?: { subnets: ISubnet[] };
  environment?: { [key: string]: string };
}

export function createLambdaFunction(stack: Stack, props: LambdaFunctionProps): NodejsFunction {
  const logGroup = new logs.LogGroup(stack, `${props.id}-LogGroup`, {
    logGroupName: `/aws/lambda/${props.functionName}`,
    retention: logs.RetentionDays.SIX_MONTHS,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  return new NodejsFunction(stack, props.id, {
    functionName: props.functionName,
    runtime: props.runtime ?? Runtime.NODEJS_22_X,
    depsLockFilePath: path.join(__dirname, "../../../yarn.lock"),
    entry: props.entry,
    handler: props.handler,
    vpc: props.vpc,
    securityGroups: props.securityGroups,
    vpcSubnets: props.vpcSubnets,
    environment: {
      STAGE: props.stage,
      ...props.environment,
    },
    bundling: {
      externalModules: [],
      minify: true,
      sourceMap: true,
    },
    logGroup,
  });
}

export const attachLambdaToResource = (
  scope: Construct,
  resource: apigateway.IResource,
  lambda: IFunction,
  cognitoArn?: string,
) => {
  let methodOptions: apigateway.MethodOptions = {
    authorizationType: apigateway.AuthorizationType.NONE,
  };

  if (cognitoArn) {
    const userPool = cognito.UserPool.fromUserPoolArn(scope, "ImportedUserPool", cognitoArn);
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(scope, "CognitoAuthorizer", {
      cognitoUserPools: [userPool],
    });

    methodOptions = {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer,
    };
  }

  resource.addMethod("ANY", new apigateway.LambdaIntegration(lambda), methodOptions);
  resource.addMethod(
    "OPTIONS",
    new apigateway.MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE,OPTIONS'",
            "method.response.header.Access-Control-Allow-Headers": "'*'",
          },
        },
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: { "application/json": '{"statusCode":200}' },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Headers": true,
          },
        },
      ],
    },
  );
};

export const exportLambdaArn = (
  stack: Stack,
  lambda: IFunction,
  id: string,
  stage: string,
): void => {
  new cdk.CfnOutput(stack, `${id}LambdaArnOutput`, {
    value: lambda.functionArn,
    exportName: `${id}LambdaArn-${stage}`,
  });
};

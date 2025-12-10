import * as cdk from "aws-cdk-lib";
import { Duration, RemovalPolicy, Size, Stack } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {
  AttributeType,
  BillingMode,
  GlobalSecondaryIndexProps,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { ISecurityGroup, ISubnet, IVpc } from "aws-cdk-lib/aws-ec2";
import { Role } from "aws-cdk-lib/aws-iam";
import { IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct, IConstruct } from "constructs";
import path from "node:path";

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
  timeout?: Duration;
  memorySize?: number;
  ephemeralStorageSize?: Size;
  bundling?: NodejsFunctionProps["bundling"];
}

export function createLambda(stack: Stack, props: LambdaFunctionProps): NodejsFunction {
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
    role: props.role,
    environment: {
      STAGE: props.stage,
      ...props.environment,
    },
    bundling: {
      externalModules: [],
      minify: true,
      sourceMap: true,
      ...props.bundling,
    },
    logGroup,
    timeout: props.timeout ?? Duration.seconds(30),
    memorySize: props.memorySize ?? 512,
    ephemeralStorageSize: props.ephemeralStorageSize ?? Size.gibibytes(1),
  });
}

export const attachLambdaToResource = (
  scope: Construct,
  resource: apigateway.IResource,
  lambda?: IFunction,
  authorizer?: apigateway.CognitoUserPoolsAuthorizer,
) => {
  const methodOptions: apigateway.MethodOptions = authorizer
    ? { authorizationType: apigateway.AuthorizationType.COGNITO, authorizer }
    : { authorizationType: apigateway.AuthorizationType.NONE };

  if (lambda === undefined) {
    console.warn(`No lambda attached for resource: ${resource.path}`);
  } else {
    resource.addMethod("ANY", new apigateway.LambdaIntegration(lambda), methodOptions);
  }
  const hasOptionsMethod = resource.node.tryFindChild("OPTIONS");
  if (hasOptionsMethod === undefined) {
    resource.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Access-Control-Allow-Methods":
                "'GET,POST,PUT,DELETE,OPTIONS'",
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
  } else {
    console.debug(`OPTIONS already exists for ${resource.path}, skipping duplicate.`);
  }
};

export interface DynamoDBProps {
  stage: string;
  id: string;
  tableName: string;
  removalPolicy: RemovalPolicy;
  partitionKey: { name: string; type: AttributeType };
  billingMode?: BillingMode;
  globalSecondaryIndices?: Array<GlobalSecondaryIndexProps>;
}
export const createDynamoDBTable = (scope: Construct, props: DynamoDBProps): Table => {
  const table = new Table(scope, props.id, {
    tableName: props.tableName,
    partitionKey: props.partitionKey,
    billingMode: props.billingMode ?? BillingMode.PAY_PER_REQUEST,
    removalPolicy: props.removalPolicy,
  });
  for (const indexProps of props.globalSecondaryIndices ?? []) {
    table.addGlobalSecondaryIndex(indexProps);
  }
  applyStandardTags(table, props.stage);
  return table;
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

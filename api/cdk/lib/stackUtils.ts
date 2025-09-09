import * as cdk from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import * as logs from "aws-cdk-lib/aws-logs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { IVpc, ISecurityGroup, ISubnet } from "aws-cdk-lib/aws-ec2";
import { IConstruct } from "constructs";
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
    logGroup,
  });
}

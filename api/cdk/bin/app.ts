import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import { ApiStack } from "../lib/apiStack";
import { DataStack } from "../lib/dataStack";
import { IamStack } from "../lib/iamStack";
import { LambdaStack } from "../lib/lambdaStack";
import { StorageStack } from "../lib/storageStack";
dotenv.config({ path: "../.env" });

const app = new cdk.App();
const region = "us-east-1";
const stage = process.env.STAGE || "local";
const account_id = process.env.AWS_ACCOUNT_ID;

const env = {
  account: account_id,
  region: region,
};

new DataStack(app, `DataStack-${stage}`, {
  stage: stage,
  env,
});

const iamStack = new IamStack(app, `IamStack-${stage}`, {
  stage,
  env,
});

const storageStack = new StorageStack(app, `StorageStack-${stage}`, {
  stage,
  env,
});

const lambdaStack = new LambdaStack(app, `LambdaStack-${stage}`, {
  stage: stage,
  lambdaRole: iamStack.role,
  messagesBucket: storageStack.messagesBucket,
  env,
});

new ApiStack(app, `ApiStack-${stage}`, {
  stage,
  lambdas: {
    express: { lambda: lambdaStack.expressLambda },
    githubOauth2: { lambda: lambdaStack.githubOauth2Lambda },
  },
});

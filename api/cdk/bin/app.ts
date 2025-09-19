#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DataStack } from "../lib/dataStack";
import { ApiStack } from "../lib/apiStack";
import { LambdaStack } from "../lib/lambdaStack";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const app = new cdk.App();
const region = "us-east-1";
const stage = process.env.STAGE || "local";
const account_id = process.env.AWS_ACCOUNT_ID;

// if (stage === "local") {
//   config({ path: path.resolve(process.cwd(), ".env") });
// }

new DataStack(app, `DataStack-${stage}`, {
  stage: stage,
  env: {
    account: account_id,
    region: region,
  },
});

const lambdaStack = new LambdaStack(app, `LambdaStack-${stage}`, {
  stage: stage,
  env: {
    account: account_id,
    region: region,
  },
});

new ApiStack(app, `ApiStack-${stage}`, {
  stage,
  githubOauth2Lambda: lambdaStack.githubOauth2,
  env: {
    account: account_id,
    region: region,
  },
});

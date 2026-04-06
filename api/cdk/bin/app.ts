import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import { ApiStack } from "../lib/apiStack";
import { DataStack } from "../lib/dataStack";
import { IamStack } from "../lib/iamStack";
import { LambdaStack } from "../lib/lambdaStack";
import { StorageStack } from "../lib/storageStack";
import {
  BUSINESSES_TABLE,
  CONTENT_STAGE,
  DEV_STAGE,
  PROD_STAGE,
  STAGING_STAGE,
  TESTING_STAGE,
  USERS_TABLE,
  MESSAGES_TABLE,
} from "../lib/constants";
import { BackupStack } from "../lib/backupStack";
import { LoggingStack } from "../lib/loggingStack";
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

new IamStack(app, `IamStack-${stage}`, {
  stage,
  env,
});

const storageStack = new StorageStack(app, `StorageStack-${stage}`, {
  stage,
  env,
});

new LoggingStack(app, `LoggingStack-${stage}`, {
  stage,
  env,
});

if (stage === DEV_STAGE) {
  new BackupStack(app, `BackupStack-${DEV_STAGE}-shared`, {
    env,
    backupRole: cdk.aws_iam.Role.fromRoleName(
      app,
      "ImportedBackupRole",
      "Backups",
    ),
    tableNames: [
      `${BUSINESSES_TABLE}-${DEV_STAGE}`,
      `${USERS_TABLE}-${DEV_STAGE}`,
      `${MESSAGES_TABLE}-${DEV_STAGE}`,
      `${BUSINESSES_TABLE}-${CONTENT_STAGE}`,
      `${MESSAGES_TABLE}-${CONTENT_STAGE}`,
      `${USERS_TABLE}-${CONTENT_STAGE}`,
      `${BUSINESSES_TABLE}-${TESTING_STAGE}`,
      `${MESSAGES_TABLE}-${TESTING_STAGE}`,
      `${USERS_TABLE}-${TESTING_STAGE}`,
    ],
  });
}

if (stage === STAGING_STAGE) {
  new BackupStack(app, `BackupStack-${STAGING_STAGE}`, {
    env,
    backupRole: cdk.aws_iam.Role.fromRoleName(
      app,
      "ImportedBackupRoleStaging",
      "Backups",
    ),
    tableNames: [
      `${BUSINESSES_TABLE}-${STAGING_STAGE}`,
      `${MESSAGES_TABLE}-${STAGING_STAGE}`,
      `${USERS_TABLE}-${STAGING_STAGE}`,
    ],
  });
}

if (stage === PROD_STAGE) {
  new BackupStack(app, `BackupStack-${PROD_STAGE}`, {
    env,
    backupRole: cdk.aws_iam.Role.fromRoleName(
      app,
      "ImportedBackupRoleProd",
      "Backups",
    ),
    tableNames: [
      `${BUSINESSES_TABLE}-${PROD_STAGE}`,
      `${MESSAGES_TABLE}-${PROD_STAGE}`,
      `${USERS_TABLE}-${PROD_STAGE}`,
    ],
  });
}

const lambdaStack = new LambdaStack(app, `LambdaStack-${stage}`, {
  stage: stage,
  messagesBucket: storageStack.messagesBucket,
  intercomMacrosBucket: stage === DEV_STAGE ? storageStack.intercomMacrosBucket : undefined,
  env,
});

new ApiStack(app, `ApiStack-${stage}`, {
  stage,
  lambdas: {
    express: { lambda: lambdaStack.expressLambda },
    githubOauth2: { lambda: lambdaStack.githubOauth2Lambda },
  },
});

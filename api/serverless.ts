import type { AWS } from "@serverless/typescript";

import express from "./src/functions/express";
import migrate from "./src/functions/migrate";

const stage = process.env.STAGE || "dev";
const dynamoOfflinePort = process.env.DYNAMO_PORT || 8000;
const offlinePort = process.env.API_PORT || 5000;
const offlineLambdaPort = process.env.LAMBDA_PORT || 5050;
const dbUser = process.env.DB_USER || "";
const dbPassword = process.env.DB_PASSWORD || "";
const dbHost = process.env.DB_HOST || "";
const dbName = process.env.DB_NAME || "";
const cognitoArn = process.env.COGNITO_ARN || "";
const useFakeLicenseClient = process.env.USE_FAKE_LICENSE_CLIENT || "";
const dbPort = "5432";
const region = "us-east-1";
const usersTable = `users-table-${stage}`;
const databaseUrl = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
const securityGroupId = process.env.VPC_SECURITY_GROUP_ID || "";
const subnetId1 = process.env.VPC_SUBNET_ID_1 || "";
const subnetId2 = process.env.VPC_SUBNET_ID_2 || "";

let vpcConfig = undefined;
if (securityGroupId && subnetId1 && subnetId2) {
  vpcConfig = {
    securityGroupIds: [securityGroupId],
    subnetIds: [subnetId1, subnetId2],
  };
}

const serverlessConfiguration: AWS = {
  useDotenv: true,
  service: "businessnjgov-api",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: {
        forceInclude: ["pg", "db-migrate", "db-migrate-pg"],
      },
    },
    dynamodb: {
      start: {
        migrate: true,
        port: dynamoOfflinePort,
      },
      stages: [stage],
    },
    "serverless-offline": {
      httpPort: offlinePort,
      lambdaPort: offlineLambdaPort,
    },
  },
  plugins: ["serverless-webpack", "serverless-dynamodb-local", "serverless-offline"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: stage,
    region: region,
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
            ],
            Resource: `arn:aws:dynamodb:${region}:*:table/${usersTable}`,
          },
          {
            Effect: "Allow",
            Action: ["s3:GetObject"],
            Resource: "arn:aws:s3:::*/*",
          },
        ],
      },
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      USERS_TABLE: usersTable,
      DB_USER: dbUser,
      DB_PASSWORD: dbPassword,
      DB_NAME: dbName,
      DB_HOST: dbHost,
      USE_FAKE_LICENSE_CLIENT: useFakeLicenseClient,
    },
    lambdaHashingVersion: "20201221",
  },
  functions: {
    express: express(cognitoArn, vpcConfig),
    migrate: migrate(databaseUrl, vpcConfig),
  },
  resources: {
    Resources: {
      UsersDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: "userId",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "userId",
              KeyType: "HASH",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          TableName: usersTable,
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;

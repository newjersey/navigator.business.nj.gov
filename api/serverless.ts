import type { AWS } from "@serverless/typescript";

import express from "./src/functions/express";

const stage = process.env.STAGE || "dev";
const dynamoOfflinePort = process.env.DYNAMO_PORT || 8000;
const offlinePort = process.env.API_PORT || 5000;
const offlineLambdaPort = process.env.LAMBDA_PORT || 5050;
const dbUser = process.env.DB_USER || "";
const dbPassword = process.env.DB_PASSWORD || "";
const dbHost = process.env.DB_HOST || "";
const dbName = process.env.DB_NAME || "";
const cognitoArn = process.env.COGNITO_ARN || "";
const region = "us-east-1";
const usersTable = `users-table-${stage}`;

const serverlessConfiguration: AWS = {
  useDotenv: true,
  service: "businessnjgov-api",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: {
        forceInclude: ["pg"],
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
    runtime: "nodejs12.x",
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
    },
    lambdaHashingVersion: "20201221",
  },
  functions: { express: express(cognitoArn) },
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

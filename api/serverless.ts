import type { AWS } from "@serverless/typescript";

import express from "./src/functions/express";

const stage = process.env.STAGE || "dev";
const dynamoOfflinePort = process.env.DYNAMO_PORT || 8000;
const offlinePort = process.env.API_PORT || 5000;
const offlineLambdaPort = process.env.LAMBDA_PORT || 5050;
const region = "us-east-1";
const usersTable = `users-table-${stage}`;

const serverlessConfiguration: AWS = {
  service: "businessnjgov-api",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
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
    iamRoleStatements: [
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
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      USERS_TABLE: usersTable,
    },
    lambdaHashingVersion: "20201221",
  },
  functions: { express },
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

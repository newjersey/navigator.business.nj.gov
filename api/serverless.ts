import type { AWS } from "@serverless/typescript";

import express from "./src/functions/express";
import updateExternalStatus from "./src/functions/updateExternalStatus";

import dynamoDbSchema from "./dynamodb-schema.json";
import { env } from "process";

const isDocker = process.env.IS_DOCKER == "true" || false; // set in docker-compose
const stage = process.env.STAGE || "local";
const dynamoOfflinePort = process.env.DYNAMO_PORT || 8000;
const offlinePort = process.env.API_PORT || 5000;
const offlineLambdaPort = process.env.LAMBDA_PORT || 5050;
const licenseStatusBaseUrl = process.env.LICENSE_STATUS_BASE_URL || "";
const businessNameBaseUrl = process.env.BUSINESS_NAME_BASE_URL || "";
const govDeliveryBaseUrl = process.env.GOV_DELIVERY_BASE_URL || "";
const govDeliveryTopic = process.env.GOV_DELIVERY_TOPIC || "";
const govDeliveryApiKey = process.env.GOV_DELIVERY_API_KEY || "";
const govDeliveryQuestionId = process.env.GOV_DELIVERY_URL_QUESTION_ID || "";

const airtableApiKey = process.env.AIRTABLE_API_KEY || "";
const airtableUserResearchBaseId = process.env.AIRTABLE_USER_RESEARCH_BASE_ID || "";
const airtableBaseUrl = process.env.AIRTABLE_BASE_URL || "";

const region = "us-east-1";
const usersTable = `users-table-${stage}`;
const ssmLocation = stage === "local" ? "dev" : stage;

const adminPassword = process.env.ADMIN_PASSWORD ?? "";

const myNJServiceToken = process.env.MYNJ_SERVICE_TOKEN || "";
const myNJRoleName = process.env.MYNJ_ROLE_NAME || "";
const myNJServiceUrl = process.env.MYNJ_SERVICE_URL || "";
const intercomHashSecret = process.env.INTERCOM_HASH_SECRET || "";

const serverlessConfiguration: AWS = {
  useDotenv: true,
  service: "businessnjgov-api",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.ts",
      includeModules: true,
    },
    dynamodb: {
      start: {
        migrate: true,
        port: dynamoOfflinePort,
      },
      stages: [stage],
    },
    "serverless-offline-ssm": {
      stages: ["offline"],
    },
    "serverless-offline": {
      host: isDocker ? "0.0.0.0" : "localhost",
      httpPort: offlinePort,
      lambdaPort: offlineLambdaPort,
    },
    config: {
      application: {
        dev: "${ssm:/config/dev/application}",
        staging: "${ssm:/config/staging/application}",
        prod: "${ssm:/config/prod/application}",
      },
      infrastructure: {
        dev: "${ssm:/config/dev}",
        staging: "${ssm:/config/staging}",
        prod: "${ssm:/config/prod}",
      },
    },
    ssmLocation: ssmLocation,
  },
  plugins: [
    "serverless-plugin-monorepo",
    "serverless-webpack",
    ...(isDocker ? [] : ["serverless-dynamodb-local"]),
    "serverless-offline-ssm",
    "serverless-offline",
  ],
  variablesResolutionMode: "20210326",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: stage,
    region: region,
    iam: {
      role: {
        managedPolicies: ["arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"],
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
            Resource: [
              `arn:aws:dynamodb:${region}:*:table/${usersTable}`,
              `arn:aws:dynamodb:${region}:*:table/${usersTable}/index/*`,
            ],
          },
          {
            Effect: "Allow",
            Action: ["s3:GetObject"],
            Resource: "arn:aws:s3:::*/*",
          },
          {
            Effect: "Allow",
            Action: ["secretsmanager:GetSecretValue"],
            Resource: `arn:aws:secretsmanager:${region}:*:secret:*`,
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
      LICENSE_STATUS_BASE_URL: licenseStatusBaseUrl,
      BUSINESS_NAME_BASE_URL: businessNameBaseUrl,
      GOV_DELIVERY_BASE_URL: govDeliveryBaseUrl,
      GOV_DELIVERY_TOPIC: govDeliveryTopic,
      GOV_DELIVERY_API_KEY: govDeliveryApiKey,
      GOV_DELIVERY_URL_QUESTION_ID: govDeliveryQuestionId,
      AIRTABLE_API_KEY: airtableApiKey,
      AIRTABLE_USER_RESEARCH_BASE_ID: airtableUserResearchBaseId,
      AIRTABLE_BASE_URL: airtableBaseUrl,
      MYNJ_SERVICE_TOKEN: myNJServiceToken,
      MYNJ_ROLE_NAME: myNJRoleName,
      MYNJ_SERVICE_URL: myNJServiceUrl,
      ADMIN_PASSWORD: adminPassword,
      STAGE: stage,
      INTERCOM_HASH_SECRET: intercomHashSecret,
    },
    lambdaHashingVersion: "20201221",
    logRetentionInDays: 180,
  },
  functions: {
    express: express(
      "${self:custom.config.application.${self:custom.ssmLocation}.COGNITO_ARN}",
      env.CI
        ? {
            securityGroupIds: [
              "${self:custom.config.infrastructure.${self:custom.ssmLocation}.SECURITY_GROUP}",
            ],
            subnetIds: [
              "${self:custom.config.infrastructure.${self:custom.ssmLocation}.SUBNET_01}",
              "${self:custom.config.infrastructure.${self:custom.ssmLocation}.SUBNET_02}",
            ],
          }
        : undefined
    ),
    govDelivery: updateExternalStatus(
      env.CI
        ? {
            securityGroupIds: [
              "${self:custom.config.infrastructure.${self:custom.ssmLocation}.SECURITY_GROUP}",
            ],
            subnetIds: [
              "${self:custom.config.infrastructure.${self:custom.ssmLocation}.SUBNET_01}",
              "${self:custom.config.infrastructure.${self:custom.ssmLocation}.SUBNET_02}",
            ],
          }
        : undefined
    ),
  },
};

if (!env.CI || stage === "local") {
  serverlessConfiguration.resources = {
    Resources: {
      UsersDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        DeletionPolicy: "Retain",
        Properties: {
          ...dynamoDbSchema,
          TableName: usersTable,
        },
      },
      GatewayResponseDefault4XX: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
          },
          ResponseType: "DEFAULT_5XX",
          RestApiId: {
            Ref: "ApiGatewayRestApi",
          },
        },
      },
    },
  };
}

module.exports = serverlessConfiguration;

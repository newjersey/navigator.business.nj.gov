import type { AWS } from "@serverless/typescript";

import express from "./src/functions/express";

const stage = process.env.STAGE || "dev";
const dynamoOfflinePort = process.env.DYNAMO_PORT || 8000;
const offlinePort = process.env.API_PORT || 5000;
const offlineLambdaPort = process.env.LAMBDA_PORT || 5050;
const cognitoArn = process.env.COGNITO_ARN || "";
const useFakeLicenseClient = process.env.USE_FAKE_LICENSE_CLIENT || "";
const licenseStatusBaseUrl = process.env.LICENSE_STATUS_BASE_URL || "";
const businessNameBaseUrl = process.env.BUSINESS_NAME_BASE_URL || "";
const region = "us-east-1";
const usersTable = `users-table-${stage}`;
const securityGroupId = process.env.VPC_SECURITY_GROUP_ID || "";
const subnetId1 = process.env.VPC_SUBNET_ID_1 || "";
const subnetId2 = process.env.VPC_SUBNET_ID_2 || "";
const vpcId = process.env.VPC_ID || "";

const myNJCert = process.env.MYNJ_CERT || "";
const myNJCertKey = process.env.MYNJ_CERT_KEY || "";
const myNJCertPassphrase = process.env.MYNJ_CERT_PASSPHRASE || "";
const myNJServiceToken = process.env.MYNJ_SERVICE_TOKEN || "";
const myNJRoleName = process.env.MYNJ_ROLE_NAME || "";
const myNJServiceUrl = process.env.MYNJ_SERVICE_URL || "";
const awsSecretId = process.env.AWS_SECRET_ID || "";

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
      USE_FAKE_LICENSE_CLIENT: useFakeLicenseClient,
      LICENSE_STATUS_BASE_URL: licenseStatusBaseUrl,
      BUSINESS_NAME_BASE_URL: businessNameBaseUrl,
      MYNJ_SERVICE_TOKEN: myNJServiceToken,
      MYNJ_ROLE_NAME: myNJRoleName,
      MYNJ_SERVICE_URL: myNJServiceUrl,
      MYNJ_CERT: myNJCert,
      MYNJ_CERT_KEY: myNJCertKey,
      MYNJ_CERT_PASSPHRASE: myNJCertPassphrase,
      AWS_SECRET_ID: awsSecretId,
    },
    lambdaHashingVersion: "20201221",
  },
  functions: {
    express: express(cognitoArn, vpcConfig),
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
            {
              AttributeName: "email",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "userId",
              KeyType: "HASH",
            },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: "EmailIndex",
              KeySchema: [
                {
                  AttributeName: "email",
                  KeyType: "HASH",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
              },
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          TableName: usersTable,
        },
      },
      VPCEndpointForDynamo: {
        Type: "AWS::EC2::VPCEndpoint",
        Properties: {
          ServiceName: `com.amazonaws.${region}.dynamodb`,
          VpcEndpointType: "Gateway",
          VpcId: vpcId,
        },
      },
      VPCEndpointForS3: {
        Type: "AWS::EC2::VPCEndpoint",
        Properties: {
          ServiceName: `com.amazonaws.${region}.s3`,
          VpcEndpointType: "Gateway",
          VpcId: vpcId,
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;

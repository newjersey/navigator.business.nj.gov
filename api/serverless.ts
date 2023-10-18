import type { AWS, AwsLambdaEnvironment } from "@serverless/typescript";
import "dotenv/config";
import { env } from "node:process";
import dynamoDbSchema from "./dynamodb-schema.json";
import encryptTaxId from "./src/functions/encryptTaxId";
import express from "./src/functions/express";
import githubOauth2 from "./src/functions/githubOauth2";
import updateExternalStatus from "./src/functions/updateExternalStatus";

const isDocker = process.env.IS_DOCKER === "true" || false; // set in docker-compose
const stage = process.env.STAGE || "local";
const dynamoOfflinePort = process.env.DYNAMO_PORT || 8000;
const offlinePort = process.env.API_PORT || 5002;
const offlineLambdaPort = process.env.LAMBDA_PORT || 5050;
const licenseStatusBaseUrl = process.env.LICENSE_STATUS_BASE_URL || "";
const businessNameBaseUrl = process.env.BUSINESS_NAME_BASE_URL || "";
const govDeliveryBaseUrl = process.env.GOV_DELIVERY_BASE_URL || "";
const govDeliveryTopic = process.env.GOV_DELIVERY_TOPIC || "";
const govDeliveryApiKey = process.env.GOV_DELIVERY_API_KEY || "";
const govDeliveryQuestionId = process.env.GOV_DELIVERY_URL_QUESTION_ID || "";
const cmsoAuthClientId = process.env.CMS_OAUTH_CLIENT_ID || "";
const cmsoAuthClientSecret = process.env.CMS_OAUTH_CLIENT_SECRET || "";
const formationApiAccount = process.env.FORMATION_API_ACCOUNT || "";
const formationApiKey = process.env.FORMATION_API_KEY || "";
const formationApiBaseUrl = process.env.FORMATION_API_BASE_URL || "";

const gov2goRegApiKey = process.env.GOV2GO_REGISTRATION_API_KEY || "";
const gov2goRegBaseUrl = process.env.GOV2GO_REGISTRATION_BASE_URL || "";

const airtableApiKey = process.env.AIRTABLE_API_KEY || "";
const airtableUserResearchBaseId = process.env.AIRTABLE_USER_RESEARCH_BASE_ID || "";
const airtableBaseUrl = process.env.AIRTABLE_BASE_URL || "";
const airtableUsersTable = process.env.AIRTABLE_USERS_TABLE || "";

const region = "us-east-1";
const usersTable = `users-table-${stage}`;
const ssmLocation = stage === "local" ? "dev" : stage;

const adminPassword = process.env.ADMIN_PASSWORD ?? "";

const myNJServiceToken = process.env.MYNJ_SERVICE_TOKEN || "";
const myNJRoleName = process.env.MYNJ_ROLE_NAME || "";
const myNJServiceUrl = process.env.MYNJ_SERVICE_URL || "";
const useFakeSelfReg = process.env.USE_FAKE_SELF_REG || "";
const intercomHashSecret = process.env.INTERCOM_HASH_SECRET || "";

const documentS3Bucket = `nj-bfs-user-documents-${stage}`;
const skipSaveDocumentsToS3 = process.env.SKIP_SAVE_DOCUMENTS_TO_S3 || "";

const awsCryptoKey = process.env.AWS_CRYPTO_KEY || "";
const awsCryptoContextStage = process.env.AWS_CRYPTO_CONTEXT_STAGE || "";
const awsCryptoContextPurpose = process.env.AWS_CRYPTO_CONTEXT_PURPOSE || "";
const awsCryptoContextOrigin = process.env.AWS_CRYPTO_CONTEXT_ORIGIN || "";

const dcaDynamicsTenantId = process.env.DCA_DYNAMICS_TENANT_ID || "";
const dcaDynamicsUrl = process.env.DCA_DYNAMICS_ORG_URL || "";
const dcaDynamicsClientId = process.env.DCA_DYNAMICS_CLIENT_ID || "";
const dcaDynamicsSecret = process.env.DCA_DYNAMICS_SECRET || "";
const featureDynamicsPublicMovers = process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS || "";

const serverlessConfiguration: AWS = {
  useDotenv: true,
  service: "businessnjgov-api",
  frameworkVersion: "3",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.ts",
      includeModules: {
        nodeModulesRelativeDir: "../",
      },
    },
    "serverless-dynamodb": {
      port: dynamoOfflinePort,
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
      noTimeout: true,
    },
    ssmLocation: ssmLocation,
  },
  plugins: [
    "serverless-webpack",
    ...(isDocker ? [] : ["serverless-dynamodb"]),
    "serverless-offline-ssm",
    "serverless-offline",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs16.x",
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
              "dynamodb:PartiQLSelect",
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
            Action: ["kms:GenerateDataKey", "kms:Encrypt", "kms:Decrypt"],
            Resource: awsCryptoKey,
          },
          {
            Effect: "Allow",
            Action: ["s3:PutObject", "s3:ListBucket", "s3:GetObject"],
            Resource: `arn:aws:s3:::${documentS3Bucket}/*`,
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
      restApiId: "${self:custom.config.application.API_GATEWEAY_ID}",
      restApiRootResourceId: "${self:custom.config.application.API_GATEWEAY_ROOT_RESOURCE_ID}",
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      USERS_TABLE: usersTable,
      LICENSE_STATUS_BASE_URL: licenseStatusBaseUrl,
      DOCUMENT_S3_BUCKET: documentS3Bucket,
      CMS_OAUTH_CLIENT_ID: cmsoAuthClientId,
      CMS_OAUTH_CLIENT_SECRET: cmsoAuthClientSecret,
      BUSINESS_NAME_BASE_URL: businessNameBaseUrl,
      DYNAMO_PORT: dynamoOfflinePort,
      GOV_DELIVERY_BASE_URL: govDeliveryBaseUrl,
      GOV_DELIVERY_TOPIC: govDeliveryTopic,
      GOV_DELIVERY_API_KEY: govDeliveryApiKey,
      GOV_DELIVERY_URL_QUESTION_ID: govDeliveryQuestionId,
      AIRTABLE_API_KEY: airtableApiKey,
      AIRTABLE_USER_RESEARCH_BASE_ID: airtableUserResearchBaseId,
      AIRTABLE_BASE_URL: airtableBaseUrl,
      AIRTABLE_USERS_TABLE: airtableUsersTable,
      FORMATION_API_ACCOUNT: formationApiAccount,
      FORMATION_API_KEY: formationApiKey,
      FORMATION_API_BASE_URL: formationApiBaseUrl,
      MYNJ_SERVICE_TOKEN: myNJServiceToken,
      MYNJ_ROLE_NAME: myNJRoleName,
      MYNJ_SERVICE_URL: myNJServiceUrl,
      USE_FAKE_SELF_REG: useFakeSelfReg,
      ADMIN_PASSWORD: adminPassword,
      GOV2GO_REGISTRATION_API_KEY: gov2goRegApiKey,
      GOV2GO_REGISTRATION_BASE_URL: gov2goRegBaseUrl,
      STAGE: stage,
      INTERCOM_HASH_SECRET: intercomHashSecret,
      SKIP_SAVE_DOCUMENTS_TO_S3: skipSaveDocumentsToS3,
      AWS_CRYPTO_KEY: awsCryptoKey,
      AWS_CRYPTO_CONTEXT_STAGE: awsCryptoContextStage,
      AWS_CRYPTO_CONTEXT_PURPOSE: awsCryptoContextPurpose,
      AWS_CRYPTO_CONTEXT_ORIGIN: awsCryptoContextOrigin,
      DCA_DYNAMICS_TENANT_ID: dcaDynamicsTenantId,
      DCA_DYNAMICS_ORG_URL: dcaDynamicsUrl,
      DCA_DYNAMICS_CLIENT_ID: dcaDynamicsClientId,
      DCA_DYNAMICS_SECRET: dcaDynamicsSecret,
      FEATURE_DYNAMICS_PUBLIC_MOVERS: featureDynamicsPublicMovers,
    } as AwsLambdaEnvironment,
    logRetentionInDays: 180,
  },
  functions: {},
};

serverlessConfiguration.custom = {
  ...serverlessConfiguration.custom,
  config: {
    application: "${ssm:/config/application}",
    infrastructure: "${ssm:/config/infrastructure}",
  },
};

serverlessConfiguration.functions = {
  ...serverlessConfiguration.functions,
  express: express(
    "${self:custom.config.application.COGNITO_ARN}",
    env.CI
      ? {
          securityGroupIds: ["${self:custom.config.infrastructure.SECURITY_GROUP}"],
          subnetIds: [
            "${self:custom.config.infrastructure.SUBNET_01}",
            "${self:custom.config.infrastructure.SUBNET_02}",
          ],
        }
      : undefined
  ),
  externalStatus: updateExternalStatus(
    env.CI
      ? {
          securityGroupIds: ["${self:custom.config.infrastructure.SECURITY_GROUP}"],
          subnetIds: [
            "${self:custom.config.infrastructure.SUBNET_01}",
            "${self:custom.config.infrastructure.SUBNET_02}",
          ],
        }
      : undefined
  ),

  encryptTaxId: encryptTaxId(
    env.CI
      ? {
          securityGroupIds: ["${self:custom.config.infrastructure.SECURITY_GROUP}"],
          subnetIds: [
            "${self:custom.config.infrastructure.SUBNET_01}",
            "${self:custom.config.infrastructure.SUBNET_02}",
          ],
        }
      : undefined
  ),
};

if (stage === "dev") {
  serverlessConfiguration.functions = {
    ...serverlessConfiguration.functions,
    githubOauth2: githubOauth2(
      env.CI
        ? {
            securityGroupIds: ["${self:custom.config.infrastructure.SECURITY_GROUP}"],
            subnetIds: [
              "${self:custom.config.infrastructure.SUBNET_01}",
              "${self:custom.config.infrastructure.SUBNET_02}",
            ],
          }
        : undefined
    ),
  };
}

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

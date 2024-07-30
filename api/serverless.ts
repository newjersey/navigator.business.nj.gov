import dynamoDbSchema from "@businessnjgovnavigator/api/dynamodb-schema.json";
import encryptTaxId from "@functions/encryptTaxId";
import express from "@functions/express";
import githubOauth2 from "@functions/githubOauth2";
import healthCheck from "@functions/healthCheck";
import updateExternalStatus from "@functions/updateExternalStatus";
import type { AWS, AwsLambdaEnvironment } from "@serverless/typescript";
import "dotenv/config";
import { env } from "node:process";

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

const healthCheckLambda = `businessnjgov-api-${stage}-healthCheck`;
const healthCheckEventRule = `health_check_lambda_event_rule`;

const documentS3Bucket = `nj-bfs-user-documents-${stage}`;
const skipSaveDocumentsToS3 = process.env.SKIP_SAVE_DOCUMENTS_TO_S3 || "";

const awsCryptoKey = process.env.AWS_CRYPTO_KEY || "";
const awsCryptoContextStage = process.env.AWS_CRYPTO_CONTEXT_STAGE || "";
const awsCryptoContextPurpose = process.env.AWS_CRYPTO_CONTEXT_PURPOSE || "";
const awsCryptoContextOrigin = process.env.AWS_CRYPTO_CONTEXT_ORIGIN || "";

const dynamicsLicenseStatusTenantId = process.env.DYNAMICS_LICENSE_STATUS_TENANT_ID || "";
const dynamicsLicenseStatusURL = process.env.DYNAMICS_LICENSE_STATUS_URL || "";
const dynamicsLicenseStatusClientId = process.env.DYNAMICS_LICENSE_STATUS_CLIENT_ID || "";
const dynamicsLicenseStatusSecret = process.env.DYNAMICS_LICENSE_STATUS_SECRET || "";
const featureDynamicsPublicMovers = process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS || "";

const dynamicsFireSafetyURL = process.env.DYNAMICS_FIRE_SAFETY_URL || "";
const dynamicsFireSafetyClientId = process.env.DYNAMICS_FIRE_SAFETY_CLIENT_ID || "";
const dynamicsFireSafetySecret = process.env.DYNAMICS_FIRE_SAFETY_SECRET || "";
const dynamicsFireSafetyTenantId = process.env.DYNAMICS_FIRE_SAFETY_TENANT_ID || "";

const dynamicsHousingURL = process.env.DYNAMICS_HOUSING_URL || "";
const dynamicsHousingClientId = process.env.DYNAMICS_HOUSING_CLIENT_ID || "";
const dynamicsHousingSecret = process.env.DYNAMICS_HOUSING_SECRET || "";
const dynamicsHousingTenantId = process.env.DYNAMICS_HOUSING_TENANT_ID || "";

const dynamicsElevatorSafetyURL = process.env.DYNAMICS_ELEVATOR_SAFETY_URL || "";
const dynamicsElevatorSafetyClientId = process.env.DYNAMICS_ELEVATOR_SAFETY_CLIENT_ID || "";
const dynamicsElevatorSafetySecret = process.env.DYNAMICS_ELEVATOR_SAFETY_SECRET || "";
const dynamicsElevatorSafetyTenantId = process.env.DYNAMICS_ELEVATOR_SAFETY_TENANT_ID || "";

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
    prune: {
      automatic: true,
      number: 5,
    },
  },
  plugins: [
    "serverless-webpack",
    ...(isDocker ? [] : ["serverless-dynamodb"]),
    "serverless-offline-ssm",
    "serverless-offline",
    "serverless-prune-plugin",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    stage: stage,
    region: region,
    iam: {
      role: {
        managedPolicies: ["arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"],
        statements: [
          {
            Effect: "Allow",
            Action: "lambda:InvokeFunction",
            Resource: `arn:aws:lambda:${region}:*:function:${healthCheckLambda}`,
            Condition: {
              ArnLike: {
                "AWS:SourceArn": `arn:aws:events:${region}:*:rule/${healthCheckEventRule}`,
              },
            },
            Sid: "InvokeLambdaFunction",
          },
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
      ADMIN_PASSWORD: adminPassword,
      AIRTABLE_API_KEY: airtableApiKey,
      AIRTABLE_BASE_URL: airtableBaseUrl,
      AIRTABLE_USER_RESEARCH_BASE_ID: airtableUserResearchBaseId,
      AIRTABLE_USERS_TABLE: airtableUsersTable,
      AWS_CRYPTO_CONTEXT_ORIGIN: awsCryptoContextOrigin,
      AWS_CRYPTO_CONTEXT_PURPOSE: awsCryptoContextPurpose,
      AWS_CRYPTO_CONTEXT_STAGE: awsCryptoContextStage,
      AWS_CRYPTO_KEY: awsCryptoKey,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      BUSINESS_NAME_BASE_URL: businessNameBaseUrl,
      CMS_OAUTH_CLIENT_ID: cmsoAuthClientId,
      CMS_OAUTH_CLIENT_SECRET: cmsoAuthClientSecret,
      DOCUMENT_S3_BUCKET: documentS3Bucket,
      DYNAMICS_ELEVATOR_SAFETY_CLIENT_ID: dynamicsElevatorSafetyClientId,
      DYNAMICS_ELEVATOR_SAFETY_SECRET: dynamicsElevatorSafetySecret,
      DYNAMICS_ELEVATOR_SAFETY_TENANT_ID: dynamicsElevatorSafetyTenantId,
      DYNAMICS_ELEVATOR_SAFETY_URL: dynamicsElevatorSafetyURL,
      DYNAMICS_FIRE_SAFETY_CLIENT_ID: dynamicsFireSafetyClientId,
      DYNAMICS_FIRE_SAFETY_SECRET: dynamicsFireSafetySecret,
      DYNAMICS_FIRE_SAFETY_TENANT_ID: dynamicsFireSafetyTenantId,
      DYNAMICS_FIRE_SAFETY_URL: dynamicsFireSafetyURL,
      DYNAMICS_HOUSING_CLIENT_ID: dynamicsHousingClientId,
      DYNAMICS_HOUSING_SECRET: dynamicsHousingSecret,
      DYNAMICS_HOUSING_TENANT_ID: dynamicsHousingTenantId,
      DYNAMICS_HOUSING_URL: dynamicsHousingURL,
      DYNAMICS_LICENSE_STATUS_CLIENT_ID: dynamicsLicenseStatusClientId,
      DYNAMICS_LICENSE_STATUS_SECRET: dynamicsLicenseStatusSecret,
      DYNAMICS_LICENSE_STATUS_TENANT_ID: dynamicsLicenseStatusTenantId,
      DYNAMICS_LICENSE_STATUS_URL: dynamicsLicenseStatusURL,
      DYNAMO_PORT: dynamoOfflinePort,
      FEATURE_DYNAMICS_PUBLIC_MOVERS: featureDynamicsPublicMovers,
      FORMATION_API_ACCOUNT: formationApiAccount,
      FORMATION_API_BASE_URL: formationApiBaseUrl,
      FORMATION_API_KEY: formationApiKey,
      GOV_DELIVERY_API_KEY: govDeliveryApiKey,
      GOV_DELIVERY_BASE_URL: govDeliveryBaseUrl,
      GOV_DELIVERY_TOPIC: govDeliveryTopic,
      GOV_DELIVERY_URL_QUESTION_ID: govDeliveryQuestionId,
      GOV2GO_REGISTRATION_API_KEY: gov2goRegApiKey,
      GOV2GO_REGISTRATION_BASE_URL: gov2goRegBaseUrl,
      INTERCOM_HASH_SECRET: intercomHashSecret,
      LICENSE_STATUS_BASE_URL: licenseStatusBaseUrl,
      MYNJ_ROLE_NAME: myNJRoleName,
      MYNJ_SERVICE_TOKEN: myNJServiceToken,
      MYNJ_SERVICE_URL: myNJServiceUrl,
      SKIP_SAVE_DOCUMENTS_TO_S3: skipSaveDocumentsToS3,
      STAGE: stage,
      USE_FAKE_SELF_REG: useFakeSelfReg,
      USERS_TABLE: usersTable,
    } as AwsLambdaEnvironment,
    logRetentionInDays: 180,
  },

  functions: {},
};

serverlessConfiguration.custom =
  stage === "local"
    ? {
        ...serverlessConfiguration.custom,
        config: {
          application: "${ssm:/dev/config/application}",
          infrastructure: "${ssm:/config/infrastructure}",
        },
      }
    : {
        ...serverlessConfiguration.custom,
        config: {
          application: "${ssm:/${self:provider.stage}/config/application}",
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
  healthCheck: healthCheck(
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

import businessesDynamoDbSchema from "@businessnjgovnavigator/api/businesses-dynamodb-schema.json";
import usersDynamoDbSchema from "@businessnjgovnavigator/api/users-dynamodb-schema.json";
import encryptTaxId from "@functions/encryptTaxId";
import express from "@functions/express";
import githubOauth2 from "@functions/githubOauth2";
import healthCheck from "@functions/healthCheck";
import migrateUsersVersion from "@functions/migrateUsersVersion";
import updateExternalStatus from "@functions/updateExternalStatus";
import updateKillSwitchParameter from "@functions/updateKillSwitchParameter";
import type { AWS, AwsLambdaEnvironment } from "@serverless/typescript";
import "dotenv/config";
import { env } from "node:process";

const isDocker = process.env.IS_DOCKER === "true" || false; // set in docker-compose
const stage = process.env.STAGE || "local";
const account_id = process.env.AWS_ACCOUNT_ID;
const dynamoOfflinePort = process.env.DYNAMO_PORT || 8000;
const offlinePort = process.env.API_PORT || 5002;
const offlineLambdaPort = process.env.LAMBDA_PORT || 5050;
const licenseStatusBaseUrl = process.env.LICENSE_STATUS_BASE_URL || "";
const xrayRegistrationStatusBaseUrl = process.env.XRAY_REGISTRATION_STATUS_BASE_URL || "";
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
const apiBaseUrl = process.env.API_BASE_URL || "";

const gov2goRegApiKey = process.env.GOV2GO_REGISTRATION_API_KEY || "";
const gov2goRegBaseUrl = process.env.GOV2GO_REGISTRATION_BASE_URL || "";

const airtableApiKey = process.env.AIRTABLE_API_KEY || "";
const airtableUserResearchBaseId = process.env.AIRTABLE_USER_RESEARCH_BASE_ID || "";
const airtableBaseUrl = process.env.AIRTABLE_BASE_URL || "";
const airtableUsersTable = process.env.AIRTABLE_USERS_TABLE || "";

const region = "us-east-1";
const usersTable = `users-table-${stage}`;
const businessesTable = `businesses-table-${stage}`;
const ssmLocation = stage === "local" ? "dev" : stage;

const devEnv = "dev";

const adminPassword = process.env.ADMIN_PASSWORD ?? "";

const myNJServiceToken = process.env.MYNJ_SERVICE_TOKEN || "";
const myNJRoleName = process.env.MYNJ_ROLE_NAME || "";
const myNJServiceUrl = process.env.MYNJ_SERVICE_URL || "";
const useFakeSelfReg = process.env.USE_FAKE_SELF_REG || "";
const intercomHashSecret = process.env.INTERCOM_HASH_SECRET || "";

const healthCheckLambda = `businessnjgov-api-${stage}-healthCheck`;
const healthCheckEventRule = `health_check_lambda_event_rule`;

const devOnly_unlinkTaxId = process.env.DEV_ONLY_UNLINK_TAX_ID || "";

const documentS3Bucket = `nj-bfs-user-documents-${stage}`;
const serverlessDeploymentS3Bucket =
  process.env.BIZNJ_SLS_DEPLOYMENT_BUCKET_NAME || "default-bucket";
const skipSaveDocumentsToS3 = process.env.SKIP_SAVE_DOCUMENTS_TO_S3 || "";

const awsCryptoTaxIdEncryptionKey = process.env.AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY || "";
const awsCryptoContextStage = process.env.AWS_CRYPTO_CONTEXT_STAGE || "";
const awsCryptoContextTaxIdEncryptionPurpose =
  process.env.AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE || "";
const awsCryptoContextOrigin = process.env.AWS_CRYPTO_CONTEXT_ORIGIN || "";
const awsCryptoTaxIdHashingKey = process.env.AWS_CRYPTO_TAX_ID_HASHING_KEY || "";
const awsCryptoContextTaxIdHashingPurpose =
  process.env.AWS_CRYPTO_CONTEXT_TAX_ID_HASHING_PURPOSE || "";

const dynamicsLicenseStatusTenantId = process.env.DYNAMICS_LICENSE_STATUS_TENANT_ID || "";
const dynamicsLicenseStatusURL = process.env.DYNAMICS_LICENSE_STATUS_URL || "";
const dynamicsLicenseStatusClientId = process.env.DYNAMICS_LICENSE_STATUS_CLIENT_ID || "";
const dynamicsLicenseStatusSecret = process.env.DYNAMICS_LICENSE_STATUS_SECRET || "";

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
const useWireMockForFormationAndBusinessSearch =
  process.env.USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH || "";
const useWireMockForGetTaxCalendarSearch =
  process.env.USE_WIREMOCK_FOR_GET_TAX_CALENDAR_SEARCH || "";

const taxClearanceCertificateUrl = process.env.TAX_CLEARANCE_CERTIFICATE_URL || "";
const taxClearanceCertificateUserName = process.env.TAX_CLEARANCE_CERTIFICATE_USER_NAME || "";
const taxClearanceCertificatePassword = process.env.TAX_CLEARANCE_CERTIFICATE_PASSWORD || "";

const etpApiAccount = process.env.ABC_ETP_API_ACCOUNT || "";
const etpApiKey = process.env.ABC_ETP_API_KEY || "";
const etpApiBaseUrl = process.env.ABC_ETP_API_BASE_URL || "";

const serverlessConfiguration: AWS = {
  useDotenv: true,
  service: "businessnjgov-api",
  frameworkVersion: "4",
  custom: {
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
    ...(isDocker ? [] : ["serverless-dynamodb"]),
    "serverless-offline-ssm",
    "serverless-offline",
    "serverless-prune-plugin",
  ],
  provider: {
    name: "aws",
    deploymentBucket: serverlessDeploymentS3Bucket,
    runtime: "nodejs22.x",
    stage: stage,
    region: region,
    iam: {
      role: {
        managedPolicies: ["arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"],
        statements: [
          {
            Effect: "Allow",
            Action: ["sns:Publish"],
            Resource: `arn:aws:sns:${region}:${account_id}:bfs-navigator-dev-cms-alert-topic`,
          },
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
            Action: "lambda:InvokeFunction",
            Resource: `arn:aws:lambda:${region}:*:function:messaging-service-*`,
            Sid: "InvokeMessagingServiceLambda",
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
              `arn:aws:dynamodb:${region}:*:table/${businessesTable}`,
              `arn:aws:dynamodb:${region}:*:table/${usersTable}/index/*`,
              `arn:aws:dynamodb:${region}:*:table/${businessesTable}/index/*`,
            ],
          },
          {
            Effect: "Allow",
            Action: ["ssm:GetParameter", "ssm:PutParameter"],
            Resource: [`arn:aws:ssm:${region}:${account_id}:parameter/${stage}/*`],
          },
          {
            Effect: "Allow",
            Action: ["s3:GetObject"],
            Resource: "arn:aws:s3:::*/*",
          },
          {
            Effect: "Allow",
            Action: ["kms:GenerateDataKey", "kms:Encrypt", "kms:Decrypt"],
            Resource: awsCryptoTaxIdEncryptionKey,
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
      AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE: awsCryptoContextTaxIdEncryptionPurpose,
      AWS_CRYPTO_CONTEXT_STAGE: awsCryptoContextStage,
      AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY: awsCryptoTaxIdEncryptionKey,
      AWS_CRYPTO_TAX_ID_HASHING_KEY: awsCryptoTaxIdHashingKey,
      AWS_CRYPTO_TAX_ID_ENCRYPTED_HASHING_SALT:
        stage === "local"
          ? "${ssm:/dev/tax_id_hashing_salt}"
          : `\${ssm:/${stage}/tax_id_hashing_salt}`,
      AWS_CRYPTO_CONTEXT_TAX_ID_HASHING_PURPOSE: awsCryptoContextTaxIdHashingPurpose,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      BUSINESS_NAME_BASE_URL: businessNameBaseUrl,
      CMS_OAUTH_CLIENT_ID: cmsoAuthClientId,
      CMS_OAUTH_CLIENT_SECRET: cmsoAuthClientSecret,
      DEV_ONLY_UNLINK_TAX_ID: devOnly_unlinkTaxId,
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
      FORMATION_API_ACCOUNT: formationApiAccount,
      API_BASE_URL: apiBaseUrl,
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
      XRAY_REGISTRATION_STATUS_BASE_URL: xrayRegistrationStatusBaseUrl,
      MYNJ_ROLE_NAME: myNJRoleName,
      MYNJ_SERVICE_TOKEN: myNJServiceToken,
      MYNJ_SERVICE_URL: myNJServiceUrl,
      SKIP_SAVE_DOCUMENTS_TO_S3: skipSaveDocumentsToS3,
      STAGE: stage,
      USE_FAKE_SELF_REG: useFakeSelfReg,
      USERS_TABLE: usersTable,
      BUSINESSES_TABLE: businessesTable,
      USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH: useWireMockForFormationAndBusinessSearch,
      USE_WIREMOCK_FOR_GET_TAX_CALENDAR_SEARCH: useWireMockForGetTaxCalendarSearch,
      TAX_CLEARANCE_CERTIFICATE_URL: taxClearanceCertificateUrl,
      TAX_CLEARANCE_CERTIFICATE_USER_NAME: taxClearanceCertificateUserName,
      TAX_CLEARANCE_CERTIFICATE_PASSWORD: taxClearanceCertificatePassword,
      ABC_ETP_API_ACCOUNT: etpApiAccount,
      ABC_ETP_API_KEY: etpApiKey,
      ABC_ETP_API_BASE_URL: etpApiBaseUrl,
    } as AwsLambdaEnvironment,
    logRetentionInDays: 180,
  },

  package: {
    patterns: ["../content/src/**", "../content/lib/**"],
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
      : undefined,
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
      : undefined,
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
      : undefined,
  ),
  migrateUsersVersion: migrateUsersVersion(
    env.CI
      ? {
          securityGroupIds: ["${self:custom.config.infrastructure.SECURITY_GROUP}"],
          subnetIds: [
            "${self:custom.config.infrastructure.SUBNET_01}",
            "${self:custom.config.infrastructure.SUBNET_02}",
          ],
        }
      : undefined,
  ),
  updateKillSwitchParameter: updateKillSwitchParameter(
    env.CI
      ? {
          securityGroupIds: ["${self:custom.config.infrastructure.SECURITY_GROUP}"],
          subnetIds: [
            "${self:custom.config.infrastructure.SUBNET_01}",
            "${self:custom.config.infrastructure.SUBNET_02}",
          ],
        }
      : undefined,
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
      : undefined,
  ),
};

if (stage === devEnv) {
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
        : undefined,
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
          ...usersDynamoDbSchema,
          TableName: usersTable,
        },
      },
      BusinessesDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        DeletionPolicy: "Retain",
        Properties: {
          ...businessesDynamoDbSchema,
          TableName: businessesTable,
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

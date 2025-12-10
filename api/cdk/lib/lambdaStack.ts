import { API_SERVICE_NAME } from "@businessnjgovnavigator/api/src/libs/constants";
import { Duration, Size, Stack, StackProps } from "aws-cdk-lib";
import { ISecurityGroup, ISubnet, IVpc, SecurityGroup, Subnet, Vpc } from "aws-cdk-lib/aws-ec2";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import { IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import path from "node:path";
import {
  BUSINESSES_TABLE,
  CONTENT_STAGE,
  DEV_STAGE,
  MESSAGES_TABLE,
  PROD_STAGE,
  TESTING_STAGE,
  USERS_TABLE,
} from "./constants";
import { createLambda, exportLambdaArn } from "./stackUtils";

export interface LambdaStackProps extends StackProps {
  stage: string;
  lambdaRole: iam.Role;
}

export class LambdaStack extends Stack {
  readonly serviceName: string;
  public readonly vpc?: IVpc;
  public readonly subnets: ISubnet[] = [];
  public readonly securityGroups: ISecurityGroup[] = [];

  public readonly lambdas: Record<string, IFunction> = {};

  get expressLambda(): IFunction {
    return this.lambdas.express;
  }
  get githubOauth2Lambda(): IFunction | undefined {
    return this.lambdas.githubOauth2;
  }

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);
    this.serviceName = API_SERVICE_NAME;

    /**
     * Environment Variables for Express lambda
     */

    const adminPassword = process.env.ADMIN_PASSWORD ?? "";
    const account_id = process.env.AWS_ACCOUNT_ID;
    const awsCryptoTaxIdEncryptionKey = process.env.AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY || "";
    const awsCryptoContextStage = process.env.AWS_CRYPTO_CONTEXT_STAGE || "";
    const awsCryptoContextTaxIdEncryptionPurpose =
      process.env.AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE || "";
    const awsCryptoContextOrigin = process.env.AWS_CRYPTO_CONTEXT_ORIGIN || "";
    const awsCryptoTaxIdHashingKey = process.env.AWS_CRYPTO_TAX_ID_HASHING_KEY || "";
    const awsCryptoContextTaxIdHashingPurpose =
      process.env.AWS_CRYPTO_CONTEXT_TAX_ID_HASHING_PURPOSE || "";
    const awsCryptoTaxIdHashingSalt =
      props.stage === "local"
        ? "${ssm:/dev/tax_id_hashing_salt}"
        : `\${ssm:/${props.stage}/tax_id_hashing_salt}`;

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

    const taxClearanceCertificateUrl = process.env.TAX_CLEARANCE_CERTIFICATE_URL || "";
    const taxClearanceCertificateUserName = process.env.TAX_CLEARANCE_CERTIFICATE_USER_NAME || "";
    const taxClearanceCertificatePassword = process.env.TAX_CLEARANCE_CERTIFICATE_PASSWORD || "";

    const etpApiAccount = process.env.ABC_ETP_API_ACCOUNT || "";
    const etpApiKey = process.env.ABC_ETP_API_KEY || "";
    const etpApiBaseUrl = process.env.ABC_ETP_API_BASE_URL || "";

    const myNJServiceToken = process.env.MYNJ_SERVICE_TOKEN || "";
    const myNJRoleName = process.env.MYNJ_ROLE_NAME || "";
    const myNJServiceUrl = process.env.MYNJ_SERVICE_URL || "";
    const intercomHashSecret = process.env.INTERCOM_HASH_SECRET || "";
    const devOnly_unlinkTaxId = process.env.DEV_ONLY_UNLINK_TAX_ID || "";

    const govDeliveryBaseUrl = process.env.GOV_DELIVERY_BASE_URL || "";
    const govDeliveryTopic = process.env.GOV_DELIVERY_TOPIC || "";
    const govDeliveryApiKey = process.env.GOV_DELIVERY_API_KEY || "";
    const govDeliveryQuestionId = process.env.GOV_DELIVERY_URL_QUESTION_ID || "";
    const gov2goRegApiKey = process.env.GOV2GO_REGISTRATION_API_KEY || "";
    const gov2goRegBaseUrl = process.env.GOV2GO_REGISTRATION_BASE_URL || "";

    const formationApiAccount = process.env.FORMATION_API_ACCOUNT || "";
    const formationApiKey = process.env.FORMATION_API_KEY || "";
    const formationApiBaseUrl = process.env.FORMATION_API_BASE_URL || "";
    const apiBaseUrl = process.env.API_BASE_URL || "";

    const licenseStatusBaseUrl = process.env.LICENSE_STATUS_BASE_URL || "";
    const xrayRegistrationStatusBaseUrl = process.env.XRAY_REGISTRATION_STATUS_BASE_URL || "";
    const businessNameBaseUrl = process.env.BUSINESS_NAME_BASE_URL || "";
    const useWireMockForFormationAndBusinessSearch =
      process.env.USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH || "";
    const useWireMockForGetTaxCalendarSearch =
      process.env.USE_WIREMOCK_FOR_GET_TAX_CALENDAR_SEARCH || "";

    const airtableApiKey = process.env.AIRTABLE_API_KEY || "";
    const airtableUserResearchBaseId = process.env.AIRTABLE_USER_RESEARCH_BASE_ID || "";
    const airtableBaseUrl = process.env.AIRTABLE_BASE_URL || "";
    const airtableUsersTable = process.env.AIRTABLE_USERS_TABLE || "";
    const usersTable = `${USERS_TABLE}-${props.stage}`;
    const messagesTable = `${MESSAGES_TABLE}-${props.stage}`;
    const documentS3Bucket = `nj-bfs-user-documents-${props.stage}`;
    const businessesTable = `${BUSINESSES_TABLE}-${props.stage}`;
    const dynamoOfflinePort = process.env.DYNAMO_PORT || "8000";

    const skipSaveDocumentsToS3 = process.env.SKIP_SAVE_DOCUMENTS_TO_S3 || "";
    const useFakeSelfReg = process.env.USE_FAKE_SELF_REG || "";

    /**
     * Environment Variables for Github Oauth2 lambda
     */

    const cmsoAuthClientId = process.env.CMS_OAUTH_CLIENT_ID || "";
    const cmsoAuthClientSecret = process.env.CMS_OAUTH_CLIENT_SECRET || "";

    // ---------- VPC/Subnet/SecurityGroup lookups for non-local ----------
    if (props.stage !== "local") {
      const vpcId = process.env.VPC_ID!;
      const subnetId1 = process.env.SUBNET_ID_01!;
      const subnetId2 = process.env.SUBNET_ID_02!;
      const sgId = process.env.SG_ID!;

      this.vpc = Vpc.fromLookup(this, "ImportedVpc", { vpcId });
      this.subnets.push(
        Subnet.fromSubnetId(this, "Subnet01", subnetId1),
        Subnet.fromSubnetId(this, "Subnet02", subnetId2),
      );
      this.securityGroups.push(SecurityGroup.fromSecurityGroupId(this, "ImportedSG", sgId));
    }
    const vpcProps =
      props.stage === "local"
        ? {}
        : {
            vpc: this.vpc,
            securityGroups: this.securityGroups,
            vpcSubnets: { subnets: this.subnets },
          };

    this.lambdas.express = createLambda(this, {
      role: props.lambdaRole,
      id: `${this.serviceName}-${props.stage}-express`,
      stage: props.stage,
      functionName: `${this.serviceName}-${props.stage}-express`,
      entry: path.join(__dirname, "../../src/functions/express/app.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(30),
      memorySize: 1024,
      ephemeralStorageSize: Size.mebibytes(512),
      ...vpcProps,

      environment: {
        ADMIN_PASSWORD: adminPassword,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        AWS_CRYPTO_TAX_ID_ENCRYPTED_HASHING_SALT: awsCryptoTaxIdHashingSalt,
        AIRTABLE_API_KEY: airtableApiKey,
        AIRTABLE_BASE_URL: airtableBaseUrl,
        AIRTABLE_USER_RESEARCH_BASE_ID: airtableUserResearchBaseId,
        AIRTABLE_USERS_TABLE: airtableUsersTable,
        API_BASE_URL: apiBaseUrl,
        ABC_ETP_API_ACCOUNT: etpApiAccount,
        ABC_ETP_API_KEY: etpApiKey,
        ABC_ETP_API_BASE_URL: etpApiBaseUrl,
        AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY: awsCryptoTaxIdEncryptionKey,
        AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE: awsCryptoContextTaxIdEncryptionPurpose,
        AWS_CRYPTO_CONTEXT_STAGE: awsCryptoContextStage,
        AWS_CRYPTO_CONTEXT_ORIGIN: awsCryptoContextOrigin,
        AWS_CRYPTO_TAX_ID_HASHING_KEY: awsCryptoTaxIdHashingKey,
        AWS_CRYPTO_CONTEXT_TAX_ID_HASHING_PURPOSE: awsCryptoContextTaxIdHashingPurpose,
        DYNAMICS_LICENSE_STATUS_URL: dynamicsLicenseStatusURL,
        DYNAMICS_LICENSE_STATUS_CLIENT_ID: dynamicsLicenseStatusClientId,
        DYNAMICS_LICENSE_STATUS_TENANT_ID: dynamicsLicenseStatusTenantId,
        DYNAMICS_LICENSE_STATUS_SECRET: dynamicsLicenseStatusSecret,
        DYNAMICS_FIRE_SAFETY_URL: dynamicsFireSafetyURL,
        DYNAMICS_FIRE_SAFETY_CLIENT_ID: dynamicsFireSafetyClientId,
        DYNAMICS_FIRE_SAFETY_SECRET: dynamicsFireSafetySecret,
        DYNAMICS_FIRE_SAFETY_TENANT_ID: dynamicsFireSafetyTenantId,
        DYNAMICS_HOUSING_URL: dynamicsHousingURL,
        DYNAMICS_HOUSING_CLIENT_ID: dynamicsHousingClientId,
        DYNAMICS_HOUSING_SECRET: dynamicsHousingSecret,
        DYNAMICS_HOUSING_TENANT_ID: dynamicsHousingTenantId,
        DYNAMICS_ELEVATOR_SAFETY_URL: dynamicsElevatorSafetyURL,
        DYNAMICS_ELEVATOR_SAFETY_CLIENT_ID: dynamicsElevatorSafetyClientId,
        DYNAMICS_ELEVATOR_SAFETY_SECRET: dynamicsElevatorSafetySecret,
        DYNAMICS_ELEVATOR_SAFETY_TENANT_ID: dynamicsElevatorSafetyTenantId,
        TAX_CLEARANCE_CERTIFICATE_URL: taxClearanceCertificateUrl,
        TAX_CLEARANCE_CERTIFICATE_USER_NAME: taxClearanceCertificateUserName,
        TAX_CLEARANCE_CERTIFICATE_PASSWORD: taxClearanceCertificatePassword,
        MYNJ_SERVICE_TOKEN: myNJServiceToken,
        MYNJ_ROLE_NAME: myNJRoleName,
        MYNJ_SERVICE_URL: myNJServiceUrl,
        INTERCOM_HASH_SECRET: intercomHashSecret,
        DEV_ONLY_UNLINK_TAX_ID: devOnly_unlinkTaxId,
        GOV_DELIVERY_API_KEY: govDeliveryApiKey,
        GOV_DELIVERY_BASE_URL: govDeliveryBaseUrl,
        GOV_DELIVERY_TOPIC: govDeliveryTopic,
        GOV_DELIVERY_URL_QUESTION_ID: govDeliveryQuestionId,
        GOV2GO_REGISTRATION_API_KEY: gov2goRegApiKey,
        GOV2GO_REGISTRATION_BASE_URL: gov2goRegBaseUrl,
        FORMATION_API_ACCOUNT: formationApiAccount,
        FORMATION_API_BASE_URL: formationApiBaseUrl,
        FORMATION_API_KEY: formationApiKey,
        LICENSE_STATUS_BASE_URL: licenseStatusBaseUrl,
        XRAY_REGISTRATION_STATUS_BASE_URL: xrayRegistrationStatusBaseUrl,
        USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH: useWireMockForFormationAndBusinessSearch,
        USE_WIREMOCK_FOR_GET_TAX_CALENDAR_SEARCH: useWireMockForGetTaxCalendarSearch,
        BUSINESS_NAME_BASE_URL: businessNameBaseUrl,
        USERS_TABLE: usersTable,
        BUSINESSES_TABLE: businessesTable,
        DOCUMENT_S3_BUCKET: documentS3Bucket,
        SKIP_SAVE_DOCUMENTS_TO_S3: skipSaveDocumentsToS3,
        USE_FAKE_SELF_REG: useFakeSelfReg,
        DYNAMO_PORT: dynamoOfflinePort,
      },
    });

    if (props.stage === DEV_STAGE) {
      this.lambdas.githubOauth2 = createLambda(this, {
        role: props.lambdaRole,
        id: `${this.serviceName}-${props.stage}-githubOauth2`,
        stage: props.stage,
        functionName: `${this.serviceName}-${props.stage}-githubOauth2`,
        entry: path.join(__dirname, "../../src/functions/githubOauth2/app.ts"),
        handler: "handler",
        runtime: Runtime.NODEJS_22_X,
        timeout: Duration.seconds(30),
        memorySize: 1024,
        ephemeralStorageSize: Size.mebibytes(512),
        ...vpcProps,
        environment: {
          CMS_OAUTH_CLIENT_ID: cmsoAuthClientId,
          CMS_OAUTH_CLIENT_SECRET: cmsoAuthClientSecret,
        },
      });
    }

    if (props.stage !== CONTENT_STAGE && props.stage !== TESTING_STAGE) {
      this.lambdas.healthCheck = createLambda(this, {
        role: props.lambdaRole,
        id: `${this.serviceName}-${props.stage}-healthCheck`,
        stage: props.stage,
        functionName: `${this.serviceName}-${props.stage}-healthCheck`,
        entry: path.join(__dirname, "../../src/functions/healthCheck/app.ts"),
        handler: "handler",
        runtime: Runtime.NODEJS_22_X,
        timeout: Duration.seconds(30),
        memorySize: 1024,
        ephemeralStorageSize: Size.mebibytes(512),
        ...vpcProps,
        environment: {
          API_BASE_URL: apiBaseUrl,
        },
      });

      const scheduleRule = new events.Rule(this, "HealthCheckSchedule", {
        schedule: events.Schedule.cron({
          minute: "0,30",
          hour: "12-20",
        }),
        description:
          "Rule targets healthCheck Lambda function; runs every 30 minutes between 8:00AM and 4:30PM EST.",
      });
      scheduleRule.addTarget(new targets.LambdaFunction(this.lambdas.healthCheck, {}));
    }

    this.lambdas.migrateUsersVersion = createLambda(this, {
      role: props.lambdaRole,
      id: `${this.serviceName}-${props.stage}-migrateUsersVersion`,
      stage: props.stage,
      functionName: `${this.serviceName}-${props.stage}-migrateUsersVersion`,
      entry: path.join(__dirname, "../../src/functions/migrateUsersVersion/app.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(30),
      memorySize: 1024,
      ephemeralStorageSize: Size.mebibytes(512),
      ...vpcProps,
      environment: {
        API_BASE_URL: apiBaseUrl,
        AWS_CRYPTO_CONTEXT_STAGE: awsCryptoContextStage,
        AWS_CRYPTO_CONTEXT_ORIGIN: awsCryptoContextOrigin,
        USERS_TABLE: usersTable,
        BUSINESSES_TABLE: businessesTable,
        AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY: awsCryptoTaxIdEncryptionKey,
        AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE: awsCryptoContextTaxIdEncryptionPurpose,
      },
    });

    const scheduleRule = new events.Rule(this, "MigrateUsersVersionSchedule", {
      enabled: false,
      ruleName: `${this.serviceName}-${props.stage}-migrateUsersVersion`,
      schedule: events.Schedule.expression(
        props.stage === PROD_STAGE ? "cron(*/5 18-23,0-5 * * ? *)" : "cron(*/5 0-5 ? * SUN *)",
      ),
      description: "Scheduled event for migrateUsersVersion Lambda",
    });
    scheduleRule.addTarget(new targets.LambdaFunction(this.lambdas.migrateUsersVersion));

    this.lambdas.updateExternalStatus = createLambda(this, {
      role: props.lambdaRole,
      id: `${this.serviceName}-${props.stage}-updateExternalStatus`,
      stage: props.stage,
      functionName: `${this.serviceName}-${props.stage}-updateExternalStatus`,
      entry: path.join(__dirname, "../../src/functions/updateExternalStatus/app.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(30),
      memorySize: 1024,
      ephemeralStorageSize: Size.mebibytes(512),
      ...vpcProps,
      environment: {
        API_BASE_URL: apiBaseUrl,
        AWS_CRYPTO_CONTEXT_STAGE: awsCryptoContextStage,
        AWS_CRYPTO_CONTEXT_ORIGIN: awsCryptoContextOrigin,
        USERS_TABLE: usersTable,
        BUSINESSES_TABLE: businessesTable,
        AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY: awsCryptoTaxIdEncryptionKey,
        AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE: awsCryptoContextTaxIdEncryptionPurpose,
        GOV_DELIVERY_API_KEY: govDeliveryApiKey,
        GOV_DELIVERY_BASE_URL: govDeliveryBaseUrl,
        GOV_DELIVERY_TOPIC: govDeliveryTopic,
        GOV_DELIVERY_URL_QUESTION_ID: govDeliveryQuestionId,
        AIRTABLE_API_KEY: airtableApiKey,
        AIRTABLE_BASE_URL: airtableBaseUrl,
        AIRTABLE_USER_RESEARCH_BASE_ID: airtableUserResearchBaseId,
        AIRTABLE_USERS_TABLE: airtableUsersTable,
      },
    });

    this.lambdas.updateKillSwitchParameter = createLambda(this, {
      role: props.lambdaRole,
      id: `${this.serviceName}-${props.stage}-updateKillSwitchParameter`,
      stage: props.stage,
      functionName: `${this.serviceName}-${props.stage}-updateKillSwitchParameter`,
      entry: path.join(__dirname, "../../src/functions/updateKillSwitchParameter/app.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(30),
      memorySize: 1024,
      ephemeralStorageSize: Size.mebibytes(512),
      ...vpcProps,
      environment: {
        API_BASE_URL: apiBaseUrl,
      },
    });

    this.lambdas.messagingService = createLambda(this, {
      role: props.lambdaRole,
      id: `${this.serviceName}-${props.stage}-messagingService`,
      stage: props.stage,
      functionName: `${this.serviceName}-${props.stage}-messagingService`,
      entry: path.join(__dirname, "../../src/functions/messagingService/app.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(30),
      memorySize: 1024,
      ephemeralStorageSize: Size.mebibytes(512),
      bundling: {
        loader: { ".html": "text" },
      },
      ...vpcProps,
      environment: {
        API_BASE_URL: apiBaseUrl,
        AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY: awsCryptoTaxIdEncryptionKey,
        AWS_CRYPTO_CONTEXT_STAGE: awsCryptoContextStage,
        AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE: awsCryptoContextTaxIdEncryptionPurpose,
        AWS_CRYPTO_CONTEXT_ORIGIN: awsCryptoContextOrigin,
        USERS_TABLE: usersTable,
        MESSAGES_TABLE: messagesTable,
      },
    });

    const topic = sns.Topic.fromTopicArn(
      this,
      `${this.serviceName}-${props.stage}-migrationLambda-Topic`,
      `arn:aws:sns:us-east-1:${account_id}:bfs-navigator-${props.stage}-migrationLambda-Topic`,
    );

    topic.addSubscription(new subs.LambdaSubscription(this.lambdas.updateKillSwitchParameter));

    exportLambdaArn(this, this.lambdas.express, "Express", props.stage);
    exportLambdaArn(this, this.lambdas.migrateUsersVersion, "MigrateUsersVersion", props.stage);
    exportLambdaArn(this, this.lambdas.updateExternalStatus, "UpdateExternalStatus", props.stage);
    exportLambdaArn(
      this,
      this.lambdas.updateKillSwitchParameter,
      "UpdateKillSwitchParameter",
      props.stage,
    );
    if (this.lambdas.githubOauth2) {
      exportLambdaArn(this, this.lambdas.githubOauth2, "GithubOauth2", props.stage);
    }
  }
}

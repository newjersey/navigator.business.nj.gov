import { API_SERVICE_NAME } from "@businessnjgovnavigator/api/src/libs/constants";
import { Stack, StackProps } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import {
  AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY,
  BUSINESSES_TABLE,
  DEV_STAGE,
  DOCUMENT_S3_BUCKET_NAME,
  MESSAGES_TABLE,
  PROD_STAGE,
  STAGING_STAGE,
  USERS_TABLE,
} from "./constants";
import { applyStandardTags } from "./stackUtils";

export interface IamStackProps extends StackProps {
  stage: string;
}

export class IamStack extends Stack {
  readonly serviceName: string;
  public readonly role: iam.Role;
  public readonly backupRole?: iam.Role;
  public readonly authRole?: iam.Role;
  public readonly unauthRole?: iam.Role;

  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);
    this.serviceName = API_SERVICE_NAME;

    const shouldCreateBackupRole =
      props.stage === DEV_STAGE || props.stage === STAGING_STAGE || props.stage === PROD_STAGE;

    if (shouldCreateBackupRole) {
      const backupRole = new iam.Role(this, "backupRole", {
        assumedBy: new iam.ServicePrincipal("backup.amazonaws.com"),
        roleName: `Backups`,
        description: `Role For Backup Service`,
      });

      backupRole.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSBackupServiceRolePolicyForBackup",
        ),
      );
      backupRole.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSBackupServiceRolePolicyForRestores",
        ),
      );

      applyStandardTags(backupRole, props.stage);
      this.backupRole = backupRole;
    }

    // Create Cognito Identity Pool roles if identity pool ID is provided
    const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID;
    if (identityPoolId) {
      // Authenticated role for Cognito Identity Pool
      const authRole = new iam.Role(this, "navigatorAuthRole", {
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": identityPoolId,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "authenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity",
        ),
        roleName: "navigator_authRole",
        description: "Role for authenticated users via Cognito Identity Pool",
      });

      applyStandardTags(authRole, props.stage);
      this.authRole = authRole;

      // Unauthenticated role for Cognito Identity Pool
      const unauthRole = new iam.Role(this, "navigatorUnauthRole", {
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": identityPoolId,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "unauthenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity",
        ),
        roleName: "navigator_unauthRole",
        description: "Role for unauthenticated users via Cognito Identity Pool",
      });

      applyStandardTags(unauthRole, props.stage);
      this.unauthRole = unauthRole;
    }

    const putMetricDataPolicyInCloudwatch = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      sid: "PutMetricDataForCloudwatchResources",
      actions: ["cloudwatch:PutMetricData"],
      resources: ["*"],
    });

    const snsPublishPolicyToCmsAlertTopic = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      sid: "SnsPublishPolicyToCmsAlertTopic",
      actions: ["sns:Publish"],
      resources: [`arn:aws:sns:${this.region}:${this.account}:bfs-navigator-dev-cms-alert-topic`],
    });

    const messagingServiceInvokePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["lambda:InvokeFunction"],
      resources: [
        `arn:aws:lambda:${this.region}:*:function:${this.serviceName}-${props.stage}-messagingService`,
      ],
      sid: "InvokeMessagingServiceLambda",
    });

    const secretsManagerPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      sid: "SecretsManagerGetSecretValue",
      actions: ["secretsmanager:GetSecretValue"],
      resources: [`arn:aws:secretsmanager:${this.region}:*:secret:*`],
    });

    const s3WritePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:PutObject", "s3:ListBucket", "s3:GetObject"],
      resources: [`arn:aws:s3:::${DOCUMENT_S3_BUCKET_NAME}-${props.stage}/*`],
      sid: "S3PermissionForDocumentsStorageBucket",
    });

    const ssmPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["ssm:GetParameter", "ssm:PutParameter"],
      resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/${props.stage}/*`],
      sid: "SSMParameterPermissions",
    });

    const dynamoPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:PartiQLSelect",
      ],
      resources: [
        `arn:aws:dynamodb:${this.region}:*:table/${USERS_TABLE}-${props.stage}`,
        `arn:aws:dynamodb:${this.region}:*:table/${USERS_TABLE}-${props.stage}/index/*`,
        `arn:aws:dynamodb:${this.region}:*:table/${BUSINESSES_TABLE}-${props.stage}`,
        `arn:aws:dynamodb:${this.region}:*:table/${BUSINESSES_TABLE}-${props.stage}/index/*`,
        `arn:aws:dynamodb:${this.region}:*:table/${MESSAGES_TABLE}-${props.stage}`,
        `arn:aws:dynamodb:${this.region}:*:table/${MESSAGES_TABLE}-${props.stage}/index/*`,
      ],
      sid: "DynamoDBAccessPolicy",
    });

    const sendEmailPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["ses:sendEmail", "ses:sendRawEmail"],
      resources: [
        `arn:aws:ses:${this.region}:${this.account}:identity/business.nj.gov`,
        `arn:aws:ses:${this.region}:${this.account}:configuration-set/*`,
      ],
    });

    const kmsEncryptPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
      resources: [AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY],
    });

    const loggingPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "logs:CreateLogStream",
        "logs:CreateLogGroup",
        "logs:TagResource",
        "logs:PutLogEvents",
      ],
      resources: [
        `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/${this.serviceName}-${props.stage}*:*`,
        `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/${this.serviceName}-${props.stage}*:*:*`,
      ],
      sid: "CloudWatchLogsPermissions",
    });

    const s3ReadPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:GetObject"],
      resources: ["arn:aws:s3:::*/*"],
    });

    const lambdaRole = new iam.Role(this, "lambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: `${this.serviceName}-${props.stage}-lambdaRole`,
      description: `Role For ${this.serviceName} Lambda Functions`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
      ],
    });

    const inlinePolicies: iam.PolicyStatement[] = [
      putMetricDataPolicyInCloudwatch,
      secretsManagerPolicy,
      s3WritePolicy,
      ssmPolicy,
      dynamoPolicy,
      loggingPolicy,
      s3ReadPolicy,
      kmsEncryptPolicy,
      messagingServiceInvokePolicy,
      sendEmailPolicy,
    ];

    const appLogGroups = ["NavigatorWebService", "NavigatorDBClient", "HealthCheckService"];

    for (const group of appLogGroups) {
      const logGroupArn = `arn:aws:logs:${this.region}:${this.account}:log-group:/${group}/*:log-stream:*`;

      lambdaRole.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:DescribeLogStreams",
            "logs:PutLogEvents",
          ],
          resources: [logGroupArn],
          sid: `${group.replace("/", "")}LogAccessPolicy`,
        }),
      );
    }
    for (const policy of inlinePolicies) {
      lambdaRole.addToPrincipalPolicy(policy);
    }
    if (props.stage === DEV_STAGE) {
      lambdaRole.addToPrincipalPolicy(snsPublishPolicyToCmsAlertTopic);
    }
    applyStandardTags(lambdaRole, props.stage);

    this.role = lambdaRole;
  }
}

import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { applyStandardTags } from "./stackUtils";
import {
  SERVICE_NAME,
  DOCUMENT_S3_BUCKET_NAME,
  USERS_TABLE,
  BUSINESSES_TABLE,
  AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY,
} from "./constants";

export interface IamStackProps extends StackProps {
  stage: string;
}

export class IamStack extends Stack {
  readonly serviceName: string;
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);
    this.serviceName = SERVICE_NAME;

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
      resources: [`arn:aws:lambda:${this.region}:*:function:messaging-service-*`],
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
        `arn:aws:dynamodb:${this.region}:*:table/${BUSINESSES_TABLE}-${props.stage}`,
        `arn:aws:dynamodb:${this.region}:*:table/${USERS_TABLE}-${props.stage}/index/*`,
        `arn:aws:dynamodb:${this.region}:*:table/${BUSINESSES_TABLE}-${props.stage}/index/*`,
      ],
      sid: "DynamoDBAccessPolicy",
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
      snsPublishPolicyToCmsAlertTopic,
      secretsManagerPolicy,
      s3WritePolicy,
      ssmPolicy,
      dynamoPolicy,
      loggingPolicy,
      s3ReadPolicy,
      kmsEncryptPolicy,
      messagingServiceInvokePolicy,
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
    applyStandardTags(lambdaRole, props.stage);

    this.role = lambdaRole;
  }
}

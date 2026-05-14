import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { DEV_STAGE, LOWER_STAGES } from "./constants";

export interface StorageStackProps extends StackProps {
  stage: string;
}

export class StorageStack extends Stack {
  public readonly messagesBucket: s3.Bucket;
  public readonly intercomMacrosBucket?: s3.Bucket;
  public readonly userDocumentsBucket: s3.Bucket;
  public readonly userDocumentsLocalBucket?: s3.Bucket;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const isLowerEnv = LOWER_STAGES.includes(props.stage);
    const removalPolicy = isLowerEnv ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN;
    const cognitoPrefix = "${cognito-identity.amazonaws.com:sub}"; // eslint-disable-line no-useless-escape

    const authRole = iam.Role.fromRoleArn(
      this,
      "CognitoAuthRole",
      `arn:aws:iam::${this.account}:role/navigator_authRole`,
    );

    const unauthRole = iam.Role.fromRoleArn(
      this,
      "CognitoUnauthRole",
      `arn:aws:iam::${this.account}:role/navigator_unauthRole`,
    );

    this.userDocumentsBucket = new s3.Bucket(this, "UserDocumentsBucket", {
      bucketName: `nj-bfs-user-documents-${props.stage}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
    });

    this.userDocumentsBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: "ListYourObjects",
        principals: [authRole, unauthRole],
        actions: ["s3:ListBucket"],
        resources: [this.userDocumentsBucket.bucketArn],
        conditions: {
          StringLike: {
            "s3:prefix": [cognitoPrefix, `${cognitoPrefix}/*`],
          },
        },
      }),
    );

    this.userDocumentsBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: "ReadDeleteYourObjects",
        principals: [authRole, unauthRole],
        actions: ["s3:GetObject", "s3:DeleteObject"],
        resources: [
          `${this.userDocumentsBucket.bucketArn}/${cognitoPrefix}`,
          `${this.userDocumentsBucket.bucketArn}/${cognitoPrefix}/*`,
        ],
      }),
    );

    this.messagesBucket = new s3.Bucket(this, "UserMessagesBucket", {
      bucketName: `nj-bfs-user-messages-${props.stage}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: removalPolicy,
      autoDeleteObjects: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
    });
    if (props.stage === DEV_STAGE) {
      this.intercomMacrosBucket = new s3.Bucket(this, "IntercomMacrosBucket", {
        bucketName: `nj-bfs-intercom-macros-${props.stage}`,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: RemovalPolicy.RETAIN,
        autoDeleteObjects: false,
        encryption: s3.BucketEncryption.S3_MANAGED,
        versioned: false,
      });

      this.userDocumentsLocalBucket = new s3.Bucket(this, "UserDocumentsLocalBucket", {
        bucketName: "nj-bfs-user-documents-local",
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: RemovalPolicy.RETAIN,
        encryption: s3.BucketEncryption.S3_MANAGED,
      });
    }
  }
}

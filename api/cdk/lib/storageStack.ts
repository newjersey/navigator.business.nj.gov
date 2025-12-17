import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { LOWER_STAGES } from "./constants";

export interface StorageStackProps extends StackProps {
  stage: string;
}

export class StorageStack extends Stack {
  public readonly emailsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const isLowerEnv = LOWER_STAGES.includes(props.stage);
    const removalPolicy = isLowerEnv ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN;

    this.emailsBucket = new s3.Bucket(this, `nj-bfs-user-emails-${props.stage}`, {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: removalPolicy,
      autoDeleteObjects: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
    });
  }
}

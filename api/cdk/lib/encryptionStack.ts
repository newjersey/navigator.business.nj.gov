import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as kms from "aws-cdk-lib/aws-kms";
import * as iam from "aws-cdk-lib/aws-iam";

export interface EncryptionStackProps extends StackProps {
  taxKMSRole: iam.IRole;
  stage: string;
}

export class EncryptionStack extends Stack {
  public readonly taxIdEncryptionKey: kms.Key;
  public readonly taxIdHashingKey: kms.Key;

  constructor(scope: Construct, id: string, props: EncryptionStackProps) {
    super(scope, id, props);

    this.taxIdHashingKey = new kms.Key(this, "TaxIdHashingKey", {
      description: `Tax Id Hashing Key for ${props.stage}`,
      enableKeyRotation: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    this.taxIdHashingKey.addAlias(`alias/${props.stage}/HashingTaxId`);

    this.taxIdHashingKey.grantEncryptDecrypt(props.taxKMSRole);
    this.taxIdHashingKey.grant(props.taxKMSRole, "kms:GenerateDataKey*");

    this.taxIdEncryptionKey = new kms.Key(this, "TaxIdEncryptionKey", {
      description: `Tax Id Encryption Key for ${props.stage}`,
      enableKeyRotation: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    this.taxIdEncryptionKey.addAlias(`alias/${props.stage}/EncryptionTaxId`);

    this.taxIdEncryptionKey.grantEncryptDecrypt(props.taxKMSRole);
    this.taxIdEncryptionKey.grant(props.taxKMSRole, "kms:GenerateDataKey*");
  }
}

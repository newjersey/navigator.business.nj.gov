import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as kms from "aws-cdk-lib/aws-kms";
import * as iam from "aws-cdk-lib/aws-iam";

export interface EncryptionStackProps extends StackProps {
  stage: string;
}

export class EncryptionStack extends Stack {
  public readonly taxIdEncryptionKey: kms.Key;
  public readonly taxIdHashingKey: kms.Key;

  constructor(scope: Construct, id: string, props: EncryptionStackProps) {
    super(scope, id, props);

    const taxKMSRole = iam.Role.fromRoleArn(
      this,
      "TaxKMSRole",
      `arn:aws:iam::${this.account}:role/iamRoleForTaxIdEncryptionAndHashing`,
    );

    this.taxIdHashingKey = new kms.Key(this, "TaxIdHashingKey", {
      description: `Tax Id Hashing Key for ${props.stage}`,
      enableKeyRotation: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    this.taxIdHashingKey.addAlias(`alias/${props.stage}/HashingTaxId`);

    this.taxIdHashingKey.grantEncryptDecrypt(taxKMSRole);
    this.taxIdHashingKey.grant(taxKMSRole, "kms:GenerateDataKey*");

    this.taxIdEncryptionKey = new kms.Key(this, "TaxIdEncryptionKey", {
      description: `Tax Id Encryption Key for ${props.stage}`,
      enableKeyRotation: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    this.taxIdEncryptionKey.addAlias(`alias/${props.stage}/EncryptionTaxId`);

    this.taxIdEncryptionKey.grantEncryptDecrypt(taxKMSRole);
    this.taxIdEncryptionKey.grant(taxKMSRole, "kms:GenerateDataKey*");
  }
}

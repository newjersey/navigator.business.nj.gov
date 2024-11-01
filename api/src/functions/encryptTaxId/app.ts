import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import {
  AWS_CRYPTO_CONTEXT_ORIGIN,
  AWS_CRYPTO_CONTEXT_PURPOSE,
  AWS_CRYPTO_CONTEXT_STAGE,
  AWS_CRYPTO_KEY,
  DYNAMO_OFFLINE_PORT,
  IS_DOCKER,
  IS_OFFLINE,
  STAGE,
  USERS_TABLE,
} from "@functions/config";
import { LogWriter } from "@libs/logWriter";
import { AWSEncryptionDecryptionFactory } from "src/client/AwsEncryptionDecryptionFactory";
import { DynamoUserDataClient } from "src/db/DynamoUserDataClient";
import { encryptTaxIdBatch } from "src/domain/user/encryptTaxIdBatch";
import { encryptTaxIdFactory } from "src/domain/user/encryptTaxIdFactory";

export default async function handler(): Promise<void> {
  const logger = LogWriter(`aws/${STAGE}`, "DataMigrationLogs");

  const dynamoDb = createDynamoDbClient(IS_OFFLINE, IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const dbClient = DynamoUserDataClient(dynamoDb, USERS_TABLE, logger);

  const AWSEncryptionDecryptionClient = AWSEncryptionDecryptionFactory(AWS_CRYPTO_KEY, {
    stage: AWS_CRYPTO_CONTEXT_STAGE,
    purpose: AWS_CRYPTO_CONTEXT_PURPOSE,
    origin: AWS_CRYPTO_CONTEXT_ORIGIN,
  });

  const encryptTaxId = encryptTaxIdFactory(AWSEncryptionDecryptionClient);
  await encryptTaxIdBatch(encryptTaxId, dbClient);
}

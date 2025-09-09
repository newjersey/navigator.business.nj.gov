import { AWSCryptoFactory } from "@client/AwsCryptoFactory";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { encryptTaxIdForBatchLambdaFactory } from "@domain/user/encryptFieldsFactory";
import {
  AWS_CRYPTO_CONTEXT_ORIGIN,
  AWS_CRYPTO_CONTEXT_STAGE,
  AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
  AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY,
  DYNAMO_OFFLINE_PORT,
  IS_DOCKER,
  IS_OFFLINE,
  STAGE,
  USERS_TABLE,
} from "@functions/config";
import { ConsoleLogWriter, LogWriter } from "@libs/logWriter";
import { DynamoUserDataClient } from "src/db/DynamoUserDataClient";
import { encryptTaxIdBatch } from "src/domain/user/encryptTaxIdBatch";

export default async function handler(): Promise<void> {
  const logger =
    process.env.STAGE === "local"
      ? ConsoleLogWriter
      : LogWriter(`NavigatorDBClient/${STAGE}`, "DataMigrationLogs");

  const dynamoDb = createDynamoDbClient(IS_OFFLINE, IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const AWSTaxIDEncryptionClient = AWSCryptoFactory(AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY, {
    stage: AWS_CRYPTO_CONTEXT_STAGE,
    purpose: AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
    origin: AWS_CRYPTO_CONTEXT_ORIGIN,
  });

  const dbClient = DynamoUserDataClient(dynamoDb, AWSTaxIDEncryptionClient, USERS_TABLE, logger);

  const encryptTaxId = encryptTaxIdForBatchLambdaFactory(AWSTaxIDEncryptionClient);
  await encryptTaxIdBatch(encryptTaxId, dbClient);
}

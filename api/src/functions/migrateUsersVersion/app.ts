import { AWSEncryptionDecryptionFactory } from "@client/AwsEncryptionDecryptionFactory";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "@db/DynamoBusinessDataClient";
import { DynamoDataClient } from "@db/DynamoDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import {
  AWS_CRYPTO_CONTEXT_ORIGIN,
  AWS_CRYPTO_CONTEXT_PURPOSE,
  AWS_CRYPTO_CONTEXT_STAGE,
  AWS_CRYPTO_KEY,
  BUSINESSES_TABLE,
  DYNAMO_OFFLINE_PORT,
  IS_DOCKER,
  IS_OFFLINE,
  STAGE,
  USERS_TABLE,
} from "@functions/config";
import { LogWriter } from "@libs/logWriter";

export default async function handler(): Promise<void> {
  const logger = LogWriter(`UsersSchemaMigration/${STAGE}`, "MigrationLogs");

  const dynamoDb = createDynamoDbClient(IS_OFFLINE, IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const AWSEncryptionDecryptionClient = AWSEncryptionDecryptionFactory(AWS_CRYPTO_KEY, {
    stage: AWS_CRYPTO_CONTEXT_STAGE,
    purpose: AWS_CRYPTO_CONTEXT_PURPOSE,
    origin: AWS_CRYPTO_CONTEXT_ORIGIN,
  });
  const userDataClient = DynamoUserDataClient(
    dynamoDb,
    AWSEncryptionDecryptionClient,
    USERS_TABLE,
    logger,
  );
  const businessesDataClient = DynamoBusinessDataClient(dynamoDb, BUSINESSES_TABLE, logger);
  const dynamoDataClient = DynamoDataClient(userDataClient, businessesDataClient, logger);
  await dynamoDataClient.migrateOutdatedVersionUsers();
}

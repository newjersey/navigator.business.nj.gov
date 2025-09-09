import { AWSCryptoFactory } from "@client/AwsCryptoFactory";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "@db/DynamoBusinessDataClient";
import { DynamoDataClient } from "@db/DynamoDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import {
  AWS_CRYPTO_CONTEXT_ORIGIN,
  AWS_CRYPTO_CONTEXT_STAGE,
  AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
  AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY,
  BUSINESSES_TABLE,
  DYNAMO_OFFLINE_PORT,
  IS_DOCKER,
  IS_OFFLINE,
  STAGE,
  USERS_TABLE,
} from "@functions/config";
import { ConsoleLogWriter, LogWriter } from "@libs/logWriter";
import { isKillSwitchOn } from "@libs/ssmUtils";

export const handler = async (): Promise<void> => {
  const logger =
    process.env.STAGE === "local"
      ? ConsoleLogWriter
      : LogWriter(`UsersSchemaMigration/${STAGE}`, "MigrationLogs");
  const killSwitchOn = await isKillSwitchOn();
  if (killSwitchOn) {
    logger.LogInfo("Migration skipped — kill switch is ON");
    return;
  }

  const dynamoDb = createDynamoDbClient(IS_OFFLINE, IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const AWSTaxIDEncryptionClient = AWSCryptoFactory(AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY, {
    stage: AWS_CRYPTO_CONTEXT_STAGE,
    purpose: AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
    origin: AWS_CRYPTO_CONTEXT_ORIGIN,
  });
  const userDataClient = DynamoUserDataClient(
    dynamoDb,
    AWSTaxIDEncryptionClient,
    USERS_TABLE,
    logger,
  );
  const businessesDataClient = DynamoBusinessDataClient(dynamoDb, BUSINESSES_TABLE, logger);
  const dynamoDataClient = DynamoDataClient(
    userDataClient,
    businessesDataClient,
    logger,
    isKillSwitchOn,
  );
  await dynamoDataClient.migrateOutdatedVersionUsers();
};

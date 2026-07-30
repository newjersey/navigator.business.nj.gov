import { AWSCryptoFactory } from "@client/AwsCryptoFactory";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "@db/DynamoBusinessDataClient";
import { DynamoDataClient } from "@db/DynamoDataClient";
import { DynamoMigrationDataClient } from "@db/DynamoMigrationDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import {
  AWS_CRYPTO_CONTEXT_ORIGIN,
  AWS_CRYPTO_CONTEXT_STAGE,
  AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
  AWS_CRYPTO_CONTEXT_TAX_ID_HASHING_PURPOSE,
  AWS_CRYPTO_TAX_ID_ENCRYPTED_HASHING_SALT,
  AWS_CRYPTO_TAX_ID_DECRYPT_ONLY_CONTEXTS,
  AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY,
  AWS_CRYPTO_TAX_ID_HASHING_KEY,
  BUSINESSES_TABLE,
  DYNAMO_OFFLINE_PORT,
  IS_DOCKER,
  LEGACY_AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY,
  STAGE,
  USERS_TABLE,
} from "@functions/config";
import { ConsoleLogWriter, LogWriter } from "@libs/logWriter";
import { isKillSwitchOn } from "@libs/ssmUtils";

const MIGRATION_SHUTDOWN_BUFFER_MS = 30_000;

interface LambdaTimeContext {
  getRemainingTimeInMillis(): number;
}

export const handler = async (_event?: unknown, context?: LambdaTimeContext): Promise<void> => {
  const isLocal = STAGE === "local";

  const logger = isLocal
    ? ConsoleLogWriter
    : LogWriter(`UsersSchemaMigration/${STAGE}`, "MigrationLogs");
  const killSwitchOn = await isKillSwitchOn();
  if (killSwitchOn) {
    logger.LogInfo("Migration skipped — kill switch is ON");
    return;
  }

  const dynamoDb = createDynamoDbClient(IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const AWSTaxIDEncryptionClient = AWSCryptoFactory(
    AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY,
    {
      stage: AWS_CRYPTO_CONTEXT_STAGE,
      purpose: AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
      origin: AWS_CRYPTO_CONTEXT_ORIGIN,
    },
    undefined,
    [LEGACY_AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY],
    AWS_CRYPTO_TAX_ID_DECRYPT_ONLY_CONTEXTS,
  );

  const AWSTaxIDHashingClient = AWSCryptoFactory(
    AWS_CRYPTO_TAX_ID_HASHING_KEY,
    {
      stage: AWS_CRYPTO_CONTEXT_STAGE,
      purpose: AWS_CRYPTO_CONTEXT_TAX_ID_HASHING_PURPOSE,
      origin: AWS_CRYPTO_CONTEXT_ORIGIN,
    },
    AWS_CRYPTO_TAX_ID_ENCRYPTED_HASHING_SALT,
  );

  const userDataClient = DynamoUserDataClient(
    dynamoDb,
    AWSTaxIDEncryptionClient,
    USERS_TABLE,
    logger,
    {
      newHashingClient: AWSTaxIDHashingClient,
    },
  );

  const businessesDataClient = DynamoBusinessDataClient(dynamoDb, BUSINESSES_TABLE, logger);
  const migrationDataClient = DynamoMigrationDataClient({
    db: dynamoDb,
    userDataClient,
    usersTableName: USERS_TABLE,
    businessesTableName: BUSINESSES_TABLE,
  });
  const dynamoDataClient = DynamoDataClient(
    userDataClient,
    businessesDataClient,
    logger,
    isKillSwitchOn,
    migrationDataClient,
  );
  const result = await dynamoDataClient.migrateOutdatedVersionUsers({
    canStartNextUser: () =>
      !context || context.getRemainingTimeInMillis() > MIGRATION_SHUTDOWN_BUFFER_MS,
  });
  if (!result.success) {
    throw new Error(result.error ?? "User migration failed");
  }
};

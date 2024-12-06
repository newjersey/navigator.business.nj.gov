import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { DYNAMO_OFFLINE_PORT, IS_DOCKER, IS_OFFLINE, STAGE, USERS_TABLE } from "@functions/config";
import { LogWriter } from "@libs/logWriter";
import { migrateUserVersion } from "@libs/migrateUserVersion";

export default async function handler(): Promise<void> {
  const logger = LogWriter(`UsersSchemaMigration/${STAGE}`, "MigrationLogs");

  const dynamoDb = createDynamoDbClient(IS_OFFLINE, IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const dbClient = DynamoUserDataClient(dynamoDb, USERS_TABLE, logger);
  await migrateUserVersion(logger, dbClient);
}

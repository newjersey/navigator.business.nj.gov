import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoBusinessesDataClient } from "@db/DynamoBusinessesDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import {
  BUSINESSES_TABLE,
  DYNAMO_OFFLINE_PORT,
  IS_DOCKER,
  IS_OFFLINE,
  STAGE,
  USERS_TABLE,
} from "@functions/config";
import { LogWriter } from "@libs/logWriter";
import { migrateBusinessesFromUsers } from "@libs/migrateBusinessesFromUsers";

export default async function handler(): Promise<void> {
  const logger = LogWriter(`OneTimeMigrationOfBusinessesFromUsersTable/${STAGE}`, "ApiLogs");

  const dynamoDb = createDynamoDbClient(IS_OFFLINE, IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const usersDbClient = DynamoUserDataClient(dynamoDb, USERS_TABLE, logger);
  const businessesDbClient = DynamoBusinessesDataClient(dynamoDb, BUSINESSES_TABLE, logger);

  try {
    const isBusinessesDataMigrationEnabled =
      process.env.ENABLE_BUSINESS_MIGRATION_FROM_USERS_TABLE === "true";

    if (!isBusinessesDataMigrationEnabled) {
      logger.LogInfo("Businesses migration is disabled");
      return;
    }

    await migrateBusinessesFromUsers(usersDbClient, businessesDbClient, logger);
  } catch (error) {
    logger.LogError(`Critical error in handler: ${error}`);
    throw error;
  }
}

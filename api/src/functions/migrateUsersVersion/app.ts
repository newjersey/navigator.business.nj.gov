import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoBusinessesDataClient } from "@db/DynamoBusinessesDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { UserAndBusinessSyncClient } from "@db/UserAndBusinessSyncClient";
import {
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
  const userDataClient = DynamoUserDataClient(dynamoDb, USERS_TABLE, logger);
  const businessesDataClient = DynamoBusinessesDataClient(dynamoDb, BUSINESSES_TABLE, logger);
  const unifiedDataClient = UserAndBusinessSyncClient(userDataClient, businessesDataClient, logger);
  await unifiedDataClient.migrateUsersAndBusinesses();
}

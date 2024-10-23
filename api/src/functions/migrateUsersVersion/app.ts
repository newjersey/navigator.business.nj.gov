import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { LogWriter } from "@libs/logWriter";
import { migrateUserVersion } from "@libs/migrateUserVersion";

export default async function handler(): Promise<void> {
  const IS_OFFLINE = process.env.IS_OFFLINE === "true" || false; // set by serverless-offline
  const IS_DOCKER = process.env.IS_DOCKER === "true" || false; // set in docker-compose
  const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
  const DYNAMO_OFFLINE_PORT = Number.parseInt(process.env.DYNAMO_PORT || "8000");
  const STAGE = process.env.STAGE || "local";
  const logger = LogWriter(`UsersSchemaMigration/${STAGE}`, "MigrationLogs");

  const dynamoDb = createDynamoDbClient(IS_OFFLINE, IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const dbClient = DynamoUserDataClient(dynamoDb, USERS_TABLE, logger);
  await migrateUserVersion(logger, dbClient);
}

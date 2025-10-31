import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "@db/DynamoBusinessDataClient";
import {
  BUSINESSES_TABLE,
  DYNAMO_OFFLINE_PORT,
  IS_DOCKER,
  IS_OFFLINE,
  STAGE,
} from "@functions/config";
import { LogWriter } from "@libs/logWriter";

export default async function handler(): Promise<void> {
  const logger = LogWriter(`DeleteExpiredBusiness/${STAGE}`, "DeletedBusinessLogs");
  logger.LogInfo("Starting Delete Expired Businesses");
  const dynamoDb = createDynamoDbClient(IS_OFFLINE, IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const businessesDataClient = DynamoBusinessDataClient(dynamoDb, BUSINESSES_TABLE, logger);
  await businessesDataClient.deleteExpiredBusinesses();
  logger.LogInfo("Completed Delete Expired Businesses");
}

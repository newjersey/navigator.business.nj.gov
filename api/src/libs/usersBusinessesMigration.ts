import { BusinessesDataClient, UserDataClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { copyBusinessDataFromUsersTableToBusinessesTable } from "@libs/migrationUtils";
import { DynamoDBStreamEvent } from "aws-lambda";

export const usersBusinessesMigration = async (
  event: DynamoDBStreamEvent,
  userDataClient: UserDataClient,
  businessesDataClient: BusinessesDataClient,
  logger: LogWriterType
): Promise<void> => {
  for (const record of event.Records) {
    logger.LogInfo(`Processing event ${record.eventName} with ID ${record.eventID}`);

    if (
      (record.eventName === "INSERT" || record.eventName === "MODIFY") &&
      record.dynamodb &&
      record.dynamodb.NewImage
    ) {
      const userId = record.dynamodb.NewImage.userId.S as string;
      logger.LogInfo(`Starting migration for userId: ${userId}`);
      try {
        const userData = await userDataClient.get(userId);
        if (!userData || !userData.businesses || Object.keys(userData.businesses).length === 0) {
          logger.LogError(`No businesses found for user ${userId}. Skipping.`);
          continue;
        }
        await copyBusinessDataFromUsersTableToBusinessesTable(userData, businessesDataClient, logger);
      } catch (error) {
        logger.LogError(`Error processing DynamoDB event for user ${userId}: ${error}`);
      }
    } else {
      logger.LogError(`Missing required data in DynamoDB record: ${JSON.stringify(record)}`);
    }
  }
};

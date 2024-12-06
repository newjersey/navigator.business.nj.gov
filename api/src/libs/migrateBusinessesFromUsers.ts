import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { BusinessesDataClient, UserDataClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { copyBusinessDataFromUsersTableToBusinessesTable } from "@libs/migrationUtils";
import { UserData } from "@shared/userData";

export const migrateBusinessesFromUsers = async (
  userDataClient: UserDataClient,
  businessesDataClient: BusinessesDataClient,
  logger: LogWriterType
): Promise<void> => {
  const processBatch = async (users: UserData[]): Promise<void> => {
    for (const userData of users) {
      logger.LogInfo(`Starting migration for userId: ${userData.user.id}`);
      if (userData && Object.keys(userData.businesses).length > 0) {
        await copyBusinessDataFromUsersTableToBusinessesTable(userData, businessesDataClient, logger);
      } else {
        logger.LogError(`Businesses not found for user ID: ${userData.user.id}`);
      }
    }
  };

  const migrateUsersInPages = async (lastEvaluatedKey?: Record<string, AttributeValue>): Promise<void> => {
    const usersWithBusinesses = await userDataClient.getUsersWithBusinesses(lastEvaluatedKey);
    await processBatch(usersWithBusinesses.users);

    if (usersWithBusinesses.lastEvaluatedKey) {
      await migrateUsersInPages(usersWithBusinesses.lastEvaluatedKey);
    }
  };

  try {
    await migrateUsersInPages();
    logger.LogInfo("Successfully migrated business");
  } catch (error) {
    logger.LogError(`Error during business migration from users:  ${error}`);
    throw new Error("Migration failed");
  }
};

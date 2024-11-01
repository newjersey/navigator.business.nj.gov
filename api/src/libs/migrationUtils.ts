import { BusinessesDataClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { UserData } from "@shared/userData";

export async function copyBusinessDataFromUsersTableToBusinessesTable(
  userData: UserData,
  businessesDataClient: BusinessesDataClient,
  logger: LogWriterType
): Promise<void> {
  for (const businessId in userData.businesses) {
    logger.LogInfo(`Starting migration for business ID ${businessId} for user ${userData.user.id}`);
    const businessData = userData.businesses[businessId];
    try {
      await businessesDataClient.put({
        ...businessData,
        id: businessId,
      });
      logger.LogInfo(`Successfully migrated business with ID ${businessId} for user ${userData.user.id}`);
    } catch (error) {
      logger.LogError(
        `Error migrating business with ID ${businessId} for user ${userData.user.id}: ${error}`
      );
    }
  }
}

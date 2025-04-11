import { BusinessesDataClient, DatabaseClient, UserDataClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { CURRENT_VERSION, UserData } from "@shared/userData";
import { chunk } from "lodash";

export const DynamoDataClient = (
  userDataClient: UserDataClient,
  businessesDataClient: BusinessesDataClient,
  logger: LogWriterType
): DatabaseClient => {
  const migrateOutdatedVersionUsers = async (): Promise<{
    success: boolean;
    migratedCount?: number;
    error?: string;
  }> => {
    try {
      let nextToken: string | undefined = undefined;
      let migratedCount = 0;
      const batchSize = 25;

      do {
        const { usersToMigrate, nextToken: newNextToken } = await userDataClient.getUsersWithOutdatedVersion(
          CURRENT_VERSION,
          nextToken
        );
        const batches = chunk(usersToMigrate, batchSize);
        for (const batch of batches) {
          await processBatch(batch);
          migratedCount += batch.length;
          logger.LogInfo(`Processed batch of ${batch.length} users. Total migrated so far: ${migratedCount}`);
        }
        nextToken = newNextToken;
      } while (nextToken);
      logger.LogInfo(
        `Migration complete. Migrated ${migratedCount} users. Current version: ${CURRENT_VERSION}`
      );
      return { success: true, migratedCount };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.LogError(`MigrateData Failed: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  const processBatch = async (usersToMigrate: UserData[]): Promise<void> => {
    const results = await Promise.allSettled(
      usersToMigrate.map(async (user) => {
        await updateUserAndBusinesses(user);
        logger.LogInfo(`Migrated user ${user.user.id} to version ${CURRENT_VERSION}`);
      })
    );

    for (const [index, result] of results.entries()) {
      const user = usersToMigrate[index];
      if (result.status === "rejected") {
        logger.LogError(`Failed to migrate user ${user.user.id}: ${result.reason}`);
      }
    }
  };

  const get = async (userId: string): Promise<UserData> => {
    return await userDataClient.get(userId);
  };

  const updateUserAndBusinesses = async (userData: UserData): Promise<void> => {
    try {
      await userDataClient.put(userData);
      logger.LogInfo(`Processed user ${userData.user.id} in the user data table`);

      if (userData.businesses && Object.keys(userData.businesses).length > 0) {
        for (const businessId in userData.businesses) {
          const businessData = userData.businesses[businessId];
          logger.LogInfo(`Updated business ${businessId} for user ${userData.user.id}`);
          try {
            await businessesDataClient.put({
              ...businessData,
              id: businessId,
            });
            logger.LogInfo(`Processed business with ID ${businessId} for user ${userData.user.id}`);
          } catch (error) {
            logger.LogError(
              `Error processing business with ID ${businessId} for user ${userData.user.id}: ${error}`
            );
          }
        }
      } else {
        logger.LogInfo(`No businesses found for user ${userData.user.id}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.LogError(`Failed to process user ${userData.user.id}: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  };

  const put = async (userData: UserData): Promise<UserData> => {
    try {
      await updateUserAndBusinesses(userData);
      return userData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.LogError(`Failed to update user ${userData.user.id}: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  };

  const findByEmail = async (email: string): Promise<UserData | undefined> => {
    return await userDataClient.findByEmail(email);
  };

  return {
    migrateOutdatedVersionUsers,
    get,
    put,
    findByEmail,
  };
};

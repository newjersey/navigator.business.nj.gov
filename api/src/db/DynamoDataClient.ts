/* eslint-disable @typescript-eslint/no-var-requires */
import { BATCH_SIZE, CONCURRENCY_LIMIT } from "@db/config/dynamoDbConfig";
import { BusinessesDataClient, DatabaseClient, UserDataClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { Business, CURRENT_VERSION, UserData } from "@shared/userData";
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

      do {
        const { usersToMigrate, nextToken: newNextToken } = await userDataClient.getUsersWithOutdatedVersion(
          CURRENT_VERSION,
          nextToken
        );
        const batches = chunk(usersToMigrate, BATCH_SIZE);
        const pLimit = require("p-limit");
        const limit = pLimit(CONCURRENCY_LIMIT);

        const batchPromises = batches.map((batch) =>
          limit(async () => {
            await processBatch(batch);
            migratedCount += batch.length;
            logger.LogInfo(
              `Processed batch of ${batch.length} users. Total migrated so far: ${migratedCount}`
            );
          })
        );

        await Promise.all(batchPromises);
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
    try {
      userDataClient.batchWriteToTable(usersToMigrate);
      const businessBatch: Business[] = usersToMigrate.flatMap((userData) =>
        Object.entries(userData.businesses).map(([businessId, businessData]) => ({
          ...businessData,
          id: businessId,
        }))
      );

      businessesDataClient.batchWriteToTable(businessBatch);
    } catch (error) {
      logger.LogError(`Error processing batch: ${error}`);
      throw new Error(`Error processing batch: ${error}`);
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

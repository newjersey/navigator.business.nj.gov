import { BusinessesDataClient, DatabaseClient, UserDataClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { Business, CURRENT_VERSION, UserData } from "@shared/userData";
import { chunk } from "lodash";
import { parseUserData } from "@db/zodSchema/zodSchemas";

export const DynamoDataClient = (
  userDataClient: UserDataClient,
  businessesDataClient: BusinessesDataClient,
  logger: LogWriterType,
  isKillSwitchOn: () => Promise<boolean>,
): DatabaseClient => {
  const MAX_SAFE_MIGRATION_COUNT = 5000;
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
        const killSwitchOn = await isKillSwitchOn();
        if (killSwitchOn) {
          logger.LogInfo(`Migration halted: kill switch is ON`);
          return { success: true, migratedCount };
        }

        const { usersToMigrate, nextToken: newNextToken } =
          await userDataClient.getUsersWithOutdatedVersion(CURRENT_VERSION, nextToken);
        const batches = chunk(usersToMigrate, batchSize);
        for (const batch of batches) {
          if (migratedCount >= MAX_SAFE_MIGRATION_COUNT) {
            logger.LogInfo(
              `Reached max safe migration count (${MAX_SAFE_MIGRATION_COUNT}), exiting early.`,
            );
            return { success: true, migratedCount };
          }
          const killSwitchBeforeEachBatch = await isKillSwitchOn();
          if (killSwitchBeforeEachBatch) {
            logger.LogInfo("Migration halted during batch processing: kill switch is ON.");
            return { success: true, migratedCount };
          }

          await processBatch(batch);
          migratedCount += batch.length;
          logger.LogInfo(
            `Processed batch of ${batch.length} users. Total migrated so far: ${migratedCount}`,
          );
        }
        nextToken = newNextToken;
      } while (nextToken);
      logger.LogInfo(
        `Migration complete. Migrated ${migratedCount} users. Current version: ${CURRENT_VERSION}`,
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
        parseUserData(logger, user);
      }),
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
      const updatedUserData = await userDataClient.put(userData);
      logger.LogInfo(`Processed user ${updatedUserData.user.id} in the user data table`);

      if (updatedUserData.businesses && Object.keys(updatedUserData.businesses).length > 0) {
        for (const businessId in updatedUserData.businesses) {
          const businessData = updatedUserData.businesses[businessId];
          logger.LogInfo(`Updated business ${businessId} for user ${updatedUserData.user.id}`);
          try {
            await businessesDataClient.put({
              ...businessData,
              id: businessId,
            });
            logger.LogInfo(
              `Processed business with ID ${businessId} for user ${updatedUserData.user.id}`,
            );
          } catch (error) {
            logger.LogError(
              `Error processing business with ID ${businessId} for user ${updatedUserData.user.id}: ${error}`,
            );
          }
        }
      } else {
        logger.LogInfo(`No businesses found for user ${updatedUserData.user.id}`);
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
  const findUserByBusinessName = async (businessName: string): Promise<UserData | undefined> => {
    try {
      const business = await businessesDataClient.findByBusinessName(businessName);
      if (!business) {
        logger.LogInfo(`No Business Found with name: ${businessName}`);
        return undefined;
      }
      const userId = business.userId;
      const user = await userDataClient.get(userId);
      if (!user) {
        logger.LogInfo(`No user found for business: ${businessName}`);
        return undefined;
      }
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.LogError(`Failed to get user for business "${businessName}": ${errorMessage}`);
      throw new Error(errorMessage);
    }
  };

  const findUsersByBusinessNamePrefix = async (prefix: string): Promise<UserData[]> => {
    try {
      const businesses = await businessesDataClient.findBusinessesByNamePrefix(prefix);

      if (!businesses || businesses.length === 0) {
        logger.LogInfo(`No Businesses Found with prefix: ${prefix}`);
        return [];
      }
      const users = await Promise.all(
        businesses.map((business) => userDataClient.get(business.userId)),
      );

      return users as UserData[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.LogError(`Failed to get users for business prefix "${prefix}": ${errorMessage}`);
      throw new Error(errorMessage);
    }
  };

  const findBusinessesByHashedTaxId = async (hashedTaxId: string): Promise<Business[]> => {
    const truncatedValue = `"${hashedTaxId.slice(0, 10)}..."`;

    try {
      const businesses = await businessesDataClient.findAllByHashedTaxId(hashedTaxId);
      if (!businesses || businesses.length === 0) {
        logger.LogInfo(`No Businesses found with hashedTaxId: ${truncatedValue}`);
        return [];
      }
      return businesses;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.LogError(
        `Failed to get Businesses with hashedTaxId matching ${truncatedValue}: ${errorMessage}`,
      );
      throw new Error(errorMessage);
    }
  };

  return {
    migrateOutdatedVersionUsers,
    get,
    put,
    findByEmail,
    findUserByBusinessName,
    findUsersByBusinessNamePrefix,
    findBusinessesByHashedTaxId,
  };
};

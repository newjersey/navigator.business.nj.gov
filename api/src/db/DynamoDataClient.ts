import { parseUserData } from "@db/zodSchema/zodSchemas";
import {
  type BusinessesDataClient,
  type DatabaseClient,
  MigrationConflictError,
  type MigrationDataClient,
  type MigrationRunOptions,
  type UserDataClient,
} from "@domain/types";
import { type LogWriterType } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";
import { type Business, CURRENT_VERSION, type UserData } from "@shared/userData";
import { chunk } from "lodash";

export const DynamoDataClient = (
  userDataClient: UserDataClient,
  businessesDataClient: BusinessesDataClient,
  logger: LogWriterType,
  isKillSwitchOn: () => Promise<boolean>,
  migrationDataClient?: MigrationDataClient,
): DatabaseClient => {
  const MAX_SAFE_MIGRATION_COUNT = 5000;
  const migrateOutdatedVersionUsers = async (
    options?: MigrationRunOptions,
  ): Promise<{
    success: boolean;
    migratedCount?: number;
    error?: string;
  }> => {
    const canStartNextUser = options?.canStartNextUser ?? ((): boolean => true);

    try {
      let nextToken: string | undefined = undefined;
      let migratedCount = 0;
      const batchSize = 25;
      const isZodParsingOn = await getConfigValue("zod_parsing_on", logger);

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

          const batchResult = await processBatch(batch, isZodParsingOn, canStartNextUser);
          migratedCount += batchResult.migratedCount;
          logger.LogInfo(
            `Completed ${batchResult.migratedCount} migrations in this batch. Total migrated so far: ${migratedCount}`,
          );
          if (batchResult.stoppedForTime) {
            return { success: true, migratedCount };
          }
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

  const processBatch = async (
    usersToMigrate: UserData[],
    isZodParsingOn: string,
    canStartNextUser: () => boolean,
  ): Promise<{ migratedCount: number; stoppedForTime: boolean }> => {
    if (!migrationDataClient) {
      throw new Error("Migration data client is required for coordinated migrations");
    }

    let migratedCount = 0;
    for (const user of usersToMigrate) {
      if (!canStartNextUser()) {
        logger.LogInfo("Migration paused before Lambda timeout; remaining users will retry");
        return { migratedCount, stoppedForTime: true };
      }

      try {
        const migratedUser = await migrationDataClient.migrateAndPut(user);
        migratedCount += 1;
        logger.LogInfo(`Migrated user to version ${CURRENT_VERSION}`);
        if (isZodParsingOn === "true") {
          parseUserData(logger, migratedUser);
        }
      } catch (error) {
        if (error instanceof MigrationConflictError) {
          logger.LogInfo("Skipped migration because the user record changed concurrently");
          continue;
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `Scheduled migration failed for user ${user.user.id} from version ${user.version} to ${CURRENT_VERSION}: ${errorMessage}`,
        );
        throw error;
      }
    }

    return { migratedCount, stoppedForTime: false };
  };

  const migrateForRequest = async (sourceUserData: UserData): Promise<UserData> => {
    if (sourceUserData.version >= CURRENT_VERSION) {
      return sourceUserData;
    }

    if (await isKillSwitchOn()) {
      logger.LogInfo("Request-time migration skipped: kill switch is ON");
      return sourceUserData;
    }

    if (!migrationDataClient) {
      logger.LogError("Request-time migration failed: migration data client is not configured");
      return sourceUserData;
    }

    try {
      return await migrationDataClient.migrateAndPut(sourceUserData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.LogError(
        `Request-time migration failed from version ${sourceUserData.version} to ${CURRENT_VERSION}: ${errorMessage}`,
      );
      return sourceUserData;
    }
  };

  const get = async (userId: string): Promise<UserData> => {
    const sourceUserData = await userDataClient.get(userId);
    return await migrateForRequest(sourceUserData);
  };

  const updateUserAndBusinesses = async (userData: UserData): Promise<void> => {
    try {
      const updatedUserData = await userDataClient.put(userData);
      logger.LogInfo(`Processed user ${updatedUserData.user.id} in the user data table`);

      if (updatedUserData.businesses && Object.keys(updatedUserData.businesses).length > 0) {
        const failedBusinessIds: string[] = [];
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
            failedBusinessIds.push(businessId);
          }
        }
        if (failedBusinessIds.length > 0) {
          throw new Error(`Failed to process businesses with IDs: ${failedBusinessIds.join(", ")}`);
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
      if (userData.version < CURRENT_VERSION) {
        if (!migrationDataClient) {
          throw new Error("Migration data client is required for coordinated migrations");
        }
        return await migrationDataClient.migrateAndPut(userData);
      }
      await updateUserAndBusinesses(userData);
      return userData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.LogError(`Failed to update user ${userData.user.id}: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  };

  const findByEmail = async (email: string): Promise<UserData | undefined> => {
    const sourceUserData = await userDataClient.findByEmail(email);
    return sourceUserData ? await migrateForRequest(sourceUserData) : undefined;
  };
  const findUserByBusinessName = async (businessName: string): Promise<UserData | undefined> => {
    try {
      const business = await businessesDataClient.findByBusinessName(businessName);
      if (!business) {
        logger.LogInfo(`No Business Found with name: ${businessName}`);
        return undefined;
      }
      const userId = business.userId;
      const user = await get(userId);
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
      const users = await Promise.all(businesses.map((business) => get(business.userId)));

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

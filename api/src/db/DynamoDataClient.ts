import { BusinessesDataClient, DatabaseClient, UserDataClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { Business, CURRENT_VERSION, UserData } from "@shared/userData";
import { get as levenshteinDistance } from "fast-levenshtein";

export const DynamoDataClient = (
  userDataClient: UserDataClient,
  businessesDataClient: BusinessesDataClient,
  logger: LogWriterType
): DatabaseClient => {
  const migrateData = async (): Promise<{
    success: boolean;
    migratedCount?: number;
    error?: string;
  }> => {
    try {
      const usersToMigrate = await userDataClient.getUsersWithOutdatedVersion(CURRENT_VERSION);
      if (usersToMigrate.length === 0) {
        logger.LogInfo("No users need migration.");
        return { success: true, migratedCount: 0 };
      }

      const usersNeedingUpdates = usersToMigrate.map(async (user) => {
        try {
          await updateUserAndBusinesses(user);
          logger.LogInfo(`Migrated user ${user.user.id} to version ${CURRENT_VERSION}`);
        } catch (error) {
          logger.LogError(`Failed to migrate user ${user.user.id}: ${error}`);
        }
      });
      await Promise.all(usersNeedingUpdates);
      logger.LogInfo(`Migration complete. Migrated ${usersToMigrate.length} users.`);
      return { success: true, migratedCount: usersToMigrate.length };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.LogError(`MigrateData Failed: ${errorMessage}`);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
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

  const findUserByBusinessName = async (businessName: string): Promise<UserData[]> => {
    const usersWithBusinesses = await userDataClient.queryUsersWithBusinesses();
    const normalizedBusinessName = businessName.trim().toLowerCase();

    const usersWithMatchingBusinessNames = await Promise.all(
      usersWithBusinesses.map(async (user: UserData) => {
        const hasMatchingBusiness = await Promise.all(
          Object.values(user.businesses).map(async (business: Business) => {
            const businessNameNormalized = business.profileData?.businessName?.toLowerCase();
            if (!businessNameNormalized) return false;
            const distance = levenshteinDistance(normalizedBusinessName, businessNameNormalized);
            return distance <= 2;
          })
        );
        return hasMatchingBusiness.some(Boolean);
      })
    );

    return usersWithBusinesses.filter((_, index) => usersWithMatchingBusinessNames[index]);
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
    migrateData,
    get,
    put,
    findByEmail,
    findUserByBusinessName,
  };
};

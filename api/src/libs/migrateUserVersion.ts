import { UserDataClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { CURRENT_VERSION } from "@shared/userData";

interface MigrationResult {
  success: boolean;
  migratedCount?: number;
  error?: string;
}

export const migrateUserVersion = (
  logger: LogWriterType,
  userDataClient: UserDataClient
): Promise<MigrationResult> => {
  return userDataClient
    .getUsersWithOutdatedVersion(CURRENT_VERSION)
    .then((usersToMigrate) => {
      if (usersToMigrate.length === 0) {
        logger.LogInfo("No users need migration.");
        return { success: true, migratedCount: 0 };
      }
      const usersNeedingUpdates = usersToMigrate.map((user) => {
        return userDataClient
          .put(user)
          .then(() => {
            logger.LogInfo(`Migrated user ${user.user.id} to version ${CURRENT_VERSION}`);
          })
          .catch((error) => {
            logger.LogError(`Failed to migrate user ${user.user.id}: ${error}`);
          });
      });

      return Promise.all(usersNeedingUpdates).then(() => {
        logger.LogInfo(`Migration complete. Migrated ${usersToMigrate.length} users.`);
        return { success: true, migratedCount: usersToMigrate.length };
      });
    })
    .catch((error) => {
      const errorMessage = `MigrateUserVersions Failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      logger.LogError(errorMessage);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    });
};

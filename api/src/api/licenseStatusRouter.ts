import { getSignedInUserId } from "@api/userRouter";
import { DatabaseClient, UpdateLicenseStatus } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { LicenseSearchNameAndAddress } from "@shared/license";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

type LicenseStatusRequestBody = {
  nameAndAddress: LicenseSearchNameAndAddress;
};

export const licenseStatusRouterFactory = (
  updateLicenseStatus: UpdateLicenseStatus,
  databaseClient: DatabaseClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/license-status", async (req, res) => {
    const requestStart = Date.now();
    const endpoint = req.originalUrl;
    const method = req.method;
    const userId = getSignedInUserId(req);
    const { nameAndAddress } = req.body as LicenseStatusRequestBody;

    logger.LogInfo(
      `[START] ${method} ${endpoint} - Received license status submission for userId: ${userId}`,
    );

    try {
      const userData = await databaseClient.get(userId);
      updateLicenseStatus(userData, nameAndAddress)
        .then(async (userData: UserData) => {
          const updatedUserData = await databaseClient.put(userData);
          const status = StatusCodes.OK;

          res.status(status).json(updatedUserData);

          logger.LogInfo(
            `[END] ${method} ${endpoint} - status: ${status}, userId: ${userId}, successfully updated license status, duration:  ${getDurationMs(
              requestStart,
            )}ms`,
          );
        })
        .catch((error) => {
          const status = StatusCodes.INTERNAL_SERVER_ERROR;
          const message = error instanceof Error ? error.message : String(error);
          logger.LogError(
            `${method} ${endpoint} - Failed to update license status: ${message}, status: ${status}, userId: ${userId}, duration:  ${getDurationMs(
              requestStart,
            )}ms`,
          );

          res.status(status).json({ error: message });
        });
    } catch (error) {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : String(error);
      logger.LogError(
        `${method} ${endpoint} - Failed to fetch user: ${message}, status: ${status}, userId: ${userId}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );

      res.status(status).json({ error: message });
    }
  });

  return router;
};

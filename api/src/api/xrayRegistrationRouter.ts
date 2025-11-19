import { getSignedInUserId } from "@api/userRouter";
import type { DatabaseClient, UpdateXrayRegistration } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import type { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const xrayRegistrationRouterFactory = (
  updateXrayRegistrationStatus: UpdateXrayRegistration,
  databaseClient: DatabaseClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/xray-registration", async (req, res) => {
    const userId = getSignedInUserId(req);
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const { facilityDetails } = req.body;
    logger.LogInfo(`[START] ${method} ${endpoint} - userId: ${userId}`);

    const userData = await databaseClient.get(userId);
    updateXrayRegistrationStatus(userData, facilityDetails)
      .then(async (response: UserData) => {
        const status = StatusCodes.OK;
        const updatedUserData = await databaseClient.put(response);
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, userId: ${userId}, successfully updated x-ray registration, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.json(updatedUserData);
      })
      .catch((error) => {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `${method} ${endpoint} - Failed to update x-ray registration: ${message}, status: ${status}, userId: ${userId}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(status).json({ error });
      });
  });

  return router;
};

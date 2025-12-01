import { getSignedInUserId } from "@api/userRouter";
import type { DatabaseClient, UpdateCRTK } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { CRTKBusinessDetails } from "@shared/crtk";
import type { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const crtkLookupRouterFactory = (
  updateCRTKUser: UpdateCRTK,
  databaseClient: DatabaseClient,
  logger: LogWriterType,
): Router => {
  const router = Router();
  router.post("/crtk-lookup", async (req, res) => {
    const userId = getSignedInUserId(req);
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const businessDetails: CRTKBusinessDetails = req.body.CRTKbusinessDetails;
    logger.LogInfo(`[START] ${method} ${endpoint} - userId: ${userId}`);

    const userData = await databaseClient.get(userId);
    updateCRTKUser(userData, businessDetails)
      .then(async (response: UserData) => {
        const status = StatusCodes.OK;
        const updatedUserData = await databaseClient.put(response);

        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, userId: ${userId}, successfully completed CRTK lookup, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.json(updatedUserData);
      })
      .catch((error) => {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `${method} ${endpoint} - Failed CRTK lookup: ${message}, status: ${status}, userId: ${userId}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(status).json({ error });
      });
  });

  return router;
};

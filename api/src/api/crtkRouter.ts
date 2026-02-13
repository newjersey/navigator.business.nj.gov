import { getSignedInUserId } from "@api/userRouter";
import { CrtkBusinessDetails } from "@businessnjgovnavigator/shared";
import type { DatabaseClient, UpdateCrtk } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import type { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const crtkLookupRouterFactory = (
  updateCrtkUser: UpdateCrtk,
  databaseClient: DatabaseClient,
  logger: LogWriterType,
): Router => {
  const router = Router();
  router.post("/crtk-lookup", async (req, res) => {
    const userId = getSignedInUserId(req);
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const businessDetails: CrtkBusinessDetails = req.body.crtkBusinessDetails;
    logger.LogInfo(`[START] ${method} ${endpoint} - userId: ${userId}`);

    const userData = await databaseClient.get(userId);
    updateCrtkUser(userData, businessDetails)
      .then(async (response: UserData) => {
        const status = StatusCodes.OK;
        await databaseClient.put(response);

        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, userId: ${userId}, successfully completed CRTK lookup, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.json(response);
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

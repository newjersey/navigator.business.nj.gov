import { ExpressRequestBody } from "@api/types";
import { type CryptoClient, DatabaseClient, TaxClearanceCertificateClient } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const taxClearanceCertificateRouterFactory = (
  taxClearanceCertificateClient: TaxClearanceCertificateClient,
  cryptoClient: CryptoClient,
  databaseClient: DatabaseClient,
  logger: LogWriterType,
): Router => {
  const router = Router();
  router.post("/postTaxClearanceCertificate", async (req: ExpressRequestBody<UserData>, res) => {
    const userData = req.body;
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const userId = userData.user?.id;
    const userIdLog = userId ? `userId: ${userId}, ` : "";

    logger.LogInfo(
      `[START] ${method} ${endpoint} - ${userIdLog}, Received request to post tax clearance certificate`,
    );
    try {
      const response = await taxClearanceCertificateClient.postTaxClearanceCertificate(
        userData,
        cryptoClient,
        databaseClient,
      );
      const status = StatusCodes.OK;
      res.status(status).json(response);
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, userId: ${userIdLog}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
    } catch (error) {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : String(error);
      logger.LogError(
        `${method} ${endpoint} - Failed to post tax clearance certificate: ${message}, status: ${status}, userId: ${userIdLog}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
      res.status(status).json({ error: message });
    }
  });

  router.post("/unlinkTaxId", async (req: ExpressRequestBody<UserData>, res) => {
    const userData = req.body;
    const userId = userData.user?.id;
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const userIdLog = userId ? `userId: ${userId}, ` : "";
    logger.LogInfo(
      `[START] ${method} ${endpoint} - ${userIdLog}, Received request to unlink tax ID`,
    );

    const unlinkEnabled = process.env.DEV_ONLY_UNLINK_TAX_ID === "true";

    // eslint-disable-next-line unicorn/no-negated-condition
    if (!unlinkEnabled) {
      const status = StatusCodes.UNAUTHORIZED;
      logger.LogError(
        `${method} ${endpoint} - Failed to unlink tax ID: userId: ${userId} attempted to unlink tax ID`,
      );
      res.status(status).json({});
    } else {
      try {
        const response = await taxClearanceCertificateClient.unlinkTaxId(userData, databaseClient);
        const status = StatusCodes.OK;
        res.status(status).json(response);
      } catch (error) {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `${method} ${endpoint} - Failed to unlink tax ID: ${message}, status: ${status}, userId: ${userIdLog}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(status).json({ error: message });
      }
    }
  });
  return router;
};

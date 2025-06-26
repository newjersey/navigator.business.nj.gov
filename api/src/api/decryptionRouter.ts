import { CryptoClient } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const decryptionRouterFactory = (
  cryptoClient: CryptoClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/decrypt", async (req, res) => {
    const { encryptedValue } = req.body;
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    logger.LogInfo(`[START] ${method} ${endpoint} - Received request to decrypt value`);
    try {
      const status = StatusCodes.OK;
      const plainTextValue = await cryptoClient.decryptValue(encryptedValue);
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, successfully completed decryption, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
      res.status(status).json(plainTextValue);
    } catch (error) {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : String(error);
      logger.LogError(
        `${method} ${endpoint} - Failed to decrypt value: ${message}, duration: ${
          Date.now() - requestStart
        }ms`,
      );
      res.status(status).send({ error: message });
    }
  });

  return router;
};

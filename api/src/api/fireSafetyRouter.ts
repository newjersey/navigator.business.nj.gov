import { FireSafetyInspectionStatus } from "@domain/types";

import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { FireSafetyInspectionResult } from "@shared/fireSafety";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const fireSafetyRouterFactory = (
  fireSafetyInspection: FireSafetyInspectionStatus,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.get("/fire-safety/:address", async (req, res) => {
    const address = req.params.address as string;
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();

    logger.LogInfo(
      `[START] ${method} ${endpoint} - Received request to retrieve fire safety information for address: ${address}`,
    );
    fireSafetyInspection(address)
      .then(async (inspectionData: FireSafetyInspectionResult[]) => {
        const status = StatusCodes.OK;
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, successfully retrieved fire-safety inspections for address: ${address}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        return res.status(status).json(inspectionData);
      })
      .catch((error) => {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `${method} ${endpoint} - Failed to retrieve fire-safety inspections: ${message}, status: ${status}, address: ${address}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(status).json({ error: message });
      });
  });

  return router;
};

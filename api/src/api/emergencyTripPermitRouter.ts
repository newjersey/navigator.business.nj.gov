import { ExpressRequestBody } from "@api/types";
import { EmergencyTripPermitClient } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitSubmitResponse,
} from "@shared/emergencyTripPermit";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const emergencyTripPermitRouterFactory = (
  emergencyTripPermitClient: EmergencyTripPermitClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post(
    "/emergencyTripPermit",
    async (req: ExpressRequestBody<EmergencyTripPermitApplicationInfo>, res) => {
      const method = req.method;
      const endpoint = req.originalUrl;
      const requestStart = Date.now();
      logger.LogInfo(
        `[START] ${method} ${endpoint} - Received request to submit emergency trip permit`,
      );

      emergencyTripPermitClient
        .apply(req.body)
        .then(async (response: EmergencyTripPermitSubmitResponse) => {
          if ("Success" in response && response.Success) {
            const status = StatusCodes.OK;
            logger.LogInfo(
              `[END] ${method} ${endpoint} - status: ${status}, successfully submitted emergency trip permit, duration: ${getDurationMs(
                requestStart,
              )}ms`,
            );
            res.status(status).json(response);
          } else {
            const status = StatusCodes.BAD_REQUEST;
            logger.LogError(
              `${method} ${endpoint} - Failed to submit emergency trip permit due to bad request, status: ${status}, duration: ${getDurationMs(
                requestStart,
              )}ms`,
            );
            res.status(status).json(response);
          }
        })
        .catch((error) => {
          const status = StatusCodes.INTERNAL_SERVER_ERROR;
          const message = error instanceof Error ? error.message : String(error);
          logger.LogError(
            `${method} ${endpoint} - Failed to submit emergency trip permit: ${message}, status: ${status}, duration: ${getDurationMs(
              requestStart,
            )}ms`,
          );
          res.status(status).json({ error: message });
        });
    },
  );

  return router;
};

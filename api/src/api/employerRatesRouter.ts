import { Router } from "express";
import { ExpressRequestBody } from "@api/types";
import { EmployerRatesRequest } from "@shared/employerRates";
import { UserData } from "@shared/userData";
import type { LogWriterType } from "@libs/logWriter";
import { EmployerRatesClient } from "@domain/types";
import { StatusCodes } from "http-status-codes";
import { getDurationMs } from "@libs/logUtils";

type EmployerRatesRequestBody = {
  employerRates: EmployerRatesRequest;
  userData: UserData;
};

export const employerRatesRouterFactory = (
  employerRatesClient: EmployerRatesClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post(
    "/checkEmployerRates",
    async (req: ExpressRequestBody<EmployerRatesRequestBody>, res) => {
      const { employerRates, userData } = req.body;
      const method = req.method;
      const endpoint = req.originalUrl;
      const requestStart = Date.now();
      const userId = userData.user.id;

      try {
        logger.LogInfo(
          `[START] ${method} ${endpoint} - Received check employer rates request for userId: ${userId}`,
        );

        const employerRatesData = await employerRatesClient.getEmployerRates(employerRates);

        const status = StatusCodes.OK;
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, userId: ${userId}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(status).json(employerRatesData);
      } catch (error) {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `${method} ${endpoint} - Failed to check employer rates: status: ${status}, userId: ${userId}, duration: ${getDurationMs(
            requestStart,
          )}ms, error: ${errorMessage}`,
        );
        res.status(status).json(errorMessage);
      }
    },
  );

  return router;
};

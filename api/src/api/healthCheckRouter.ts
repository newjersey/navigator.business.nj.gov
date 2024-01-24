import type { HealthCheckMetadata, HealthCheckMethod, SuccessfulHealthCheckResponse } from "@domain/types";
import { Router } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const requestTimestamp = (): number => Math.round(Date.now() / 1000);

const healthCheckResponseStatus = (response: HealthCheckMetadata): StatusCodes => {
  let statusCode = StatusCodes.OK;

  if (!response.success && response.error) {
    statusCode = response.error.timeout ? StatusCodes.GATEWAY_TIMEOUT : StatusCodes.BAD_GATEWAY;
  }

  return statusCode;
};

type HealthCheckEndpoint = string;
type HealthChecks = Map<HealthCheckEndpoint, HealthCheckMethod>;

export const healthCheckRouterFactory = (clients: HealthChecks): Router => {
  const router = Router();

  router.get("/self", (_req, res) => {
    res.json({
      timestamp: requestTimestamp(),
      success: true,
      data: {
        message: ReasonPhrases.OK,
      },
    } as SuccessfulHealthCheckResponse);
  });

  for (const [endpoint, client] of clients) {
    router.get(`/${endpoint}`, async (_req, res) => {
      const timestamp = requestTimestamp();
      const healthCheckResult = await client();
      const statusCode = healthCheckResponseStatus(healthCheckResult);

      res.status(statusCode).json({
        timestamp,
        ...healthCheckResult,
      });
    });
  }

  return router;
};

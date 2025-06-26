import type {
  HealthCheckMetadata,
  HealthCheckMethod,
  SuccessfulHealthCheckResponse,
} from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
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

export const healthCheckRouterFactory = (clients: HealthChecks, logger: LogWriterType): Router => {
  const router = Router();

  router.get("/self", (_req, res) => {
    const method = _req.method;
    const endpoint = _req.originalUrl;
    const requestStart = Date.now();
    const status = StatusCodes.OK;
    logger.LogInfo(`[START] ${method} ${endpoint} - Performing self health check`);
    res.status(status).json({
      timestamp: requestTimestamp(),
      success: true,
      data: {
        message: ReasonPhrases.OK,
      },
    } as SuccessfulHealthCheckResponse);

    logger.LogInfo(
      `[END] ${method} ${endpoint} - status: ${status}, completed health check for endpoint: ${endpoint}, duration: ${getDurationMs(
        requestStart,
      )}ms`,
    );
  });

  for (const [endpoint, client] of clients) {
    router.get(`/${endpoint}`, async (_req, res) => {
      logger.LogInfo(`[START]- Performing health check for endpoint: ${endpoint}`);
      const timestamp = requestTimestamp();
      const method = _req.method;
      const requestStart = Date.now();
      const healthCheckResult = await client();
      const statusCode = healthCheckResponseStatus(healthCheckResult);

      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${statusCode}, completed health check for endpoint:${endpoint}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
      res.status(statusCode).json({
        timestamp,
        ...healthCheckResult,
      });
    });
  }

  return router;
};

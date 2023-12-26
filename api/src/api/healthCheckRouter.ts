import {
  HealthCheckMethod,
  SuccessfulHealthCheckResponse,
  UnsuccessfulHealthCheckResponse,
} from "@domain/types";
import { Router } from "express";

/* TODO: Building out this feature:
 *
 * - Ensure continued access to the /health endpoint for the entire app.
 * - Create functions for checking Boomi and Dynamics health.
 * - Use dependency inversion to make the health checks dynamic.
 * - Wire up these functions to the appropriate endpoints.
 */

const selfCheck: HealthCheckMethod = async () => {
  return {
    success: true,
    data: {
      message: "Alive",
    },
  } as SuccessfulHealthCheckResponse;
};

export const healthCheckRouter = (elevatorSafetyHealthCheckClient: HealthCheckMethod): Router => {
  const router = Router();
  const requestTimestamp = Math.round(Date.now() / 1000);

  router.all("/", async (_req, res) => {
    const selfCheckResult = await selfCheck();

    if (selfCheckResult.success) {
      res.status(200).json({
        timestamp: requestTimestamp,
        data: selfCheckResult.data,
      });
    } else {
      res.status(500).json({
        timestamp: requestTimestamp,
        data: selfCheckResult.error,
      });
    }
  });

  router.get("/dynamics/elevator", async (_req, res) => {
    const elevatorHealthCheck = await elevatorSafetyHealthCheckClient();
    if (elevatorHealthCheck.success) {
      res.status(200).json({
        timestamp: requestTimestamp,
        data: elevatorHealthCheck as SuccessfulHealthCheckResponse,
      });
    } else {
      res.status(500).json({
        timestamp: requestTimestamp,
        data: elevatorHealthCheck as UnsuccessfulHealthCheckResponse,
      });
    }
  });

  return router;
};

import { Router } from "express";

/* TODO: Building out this feature:
 *
 * - Ensure continued access to the /health endpoint for the entire app.
 * - Create functions for checking Boomi and Dynamics health.
 * - Use dependency inversion to make the health checks dynamic.
 * - Wire up these functions to the appropriate endpoints.
 */

interface SuccessfulHealthCheckResponse {
  success: true;
  data: {
    message: string;
  };
}

interface UnsuccessfulHealthCheckResponse {
  success: false;
  error: {
    timeout: boolean;
    message: string;
    serverResponseCode?: number;
    serverResponseBody?: string;
  };
}

type HealthCheckResponse = SuccessfulHealthCheckResponse | UnsuccessfulHealthCheckResponse;

type HealthCheckMethod = () => Promise<HealthCheckResponse>;

const selfCheck: HealthCheckMethod = async () => {
  return {
    success: true,
    data: {
      message: "Alive",
    },
  } as SuccessfulHealthCheckResponse;
};

export const healthCheckRouter = (): Router => {
  const router = Router();

  router.all("/", async (_req, res) => {
    const requestTimestamp = Math.round(Date.now() / 1000);
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

  return router;
};

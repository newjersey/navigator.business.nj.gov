import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import type { LogWriterType } from "@libs/logWriter";
import axios, { type AxiosError, type AxiosResponse } from "axios";

type Status = "PASS" | "FAIL" | "ERROR";
type StatusResult = Record<string, Status>;

const cw = new CloudWatchClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const healthCheckEndPoints: Record<string, string> = {
  self: "self",
  elevator: "dynamics/elevator",
  fireSafety: "dynamics/fire-safety",
  housing: "dynamics/housing",
  rgbDynamicsLicenseStatus: "rgbDynamics/license-status",
  webserviceLicenseStatus: "webservice/license-status",
  webserviceFormation: "webservice/formation",
  taxClearance: "tax-clearance",
  xrayRegistration: "xray-registration",
  taxFilingClient: "tax-filing-client",
};

const healthCheck = async (type: string, url: string, logger: LogWriterType): Promise<Status> => {
  const fullUrl = `${url}/health/${type}`;

  return axios
    .get(fullUrl)
    .then(async (response: AxiosResponse): Promise<Status> => {
      if (response.data.success === true) {
        logger.LogInfo(`Health Check Status - Endpoint: ${type}: PASS`);
        return "PASS";
      } else {
        logger.LogError(`Health Check Status - Endpoint: ${type}: FAIL`, response.data);
        await sendMetric(type, logger);
        return "FAIL";
      }
    })
    .catch(async (error: AxiosError): Promise<Status> => {
      logger.LogError(`Health Check Status - Endpoint: ${type}: FAIL ERROR`, error);
      await sendMetric(type, logger);
      return "ERROR";
    });
};

const sendMetric = async (endpoint: string, logger: LogWriterType): Promise<void> => {
  try {
    await cw.send(
      new PutMetricDataCommand({
        Namespace: "BFS/Navigator",
        MetricData: [
          {
            MetricName: "HealthCheckError",
            Dimensions: [
              { Name: "Endpoint", Value: endpoint },
              { Name: "Stage", Value: process.env.STAGE ?? "unknown" },
            ],
            Value: 1,
            Unit: "Count",
          },
        ],
      }),
    );
  } catch (error: unknown) {
    const stage = process.env.STAGE ?? "unknown";
    const message = `Failed to push metric to CloudWatch for endpoint "${endpoint}" in stage "${stage}"`;

    logger.LogError(message, error);
  }
};

export const runHealthChecks = async (logger: LogWriterType): Promise<StatusResult> => {
  const url = process.env.API_BASE_URL;
  if (!url) {
    logger.LogError("API URL is undefined");
    throw new Error("API URL is undefined");
  }

  const entries = Object.entries(healthCheckEndPoints).map(([type, endpoint]) =>
    healthCheck(endpoint ?? "", url, logger).then((result) => [type, result] as const),
  );

  const resolved = await Promise.all(entries);

  return Object.fromEntries(resolved);
};

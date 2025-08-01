import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError, AxiosResponse } from "axios";

type Status = "PASS" | "FAIL" | "ERROR";
type StatusResult = Record<string, Status>;

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
};

const healthCheck = async (type: string, url: string, logger: LogWriterType): Promise<Status> => {
  return axios
    .get(`${url}/health/${type}`)
    .then((response: AxiosResponse) => {
      if (response.data.success === true) {
        logger.LogInfo(`Health Check Status - Endpoint: ${type}: PASS`);
        return "PASS";
      } else {
        logger.LogError(`Health Check Status - Endpoint: ${type}: FAIL`, response.data);
        return "FAIL";
      }
    })
    .catch((error: AxiosError) => {
      logger.LogError(`Health Check Status - Endpoint: ${type}: FAIL ERROR`, error);
      return "ERROR";
    });
};

export const runHealthChecks = async (logger: LogWriterType): Promise<StatusResult> => {
  const url = process.env.API_BASE_URL;
  if (!url) {
    logger.LogError("API URL is undefined");
    throw new Error("API URL is undefined");
  }
  const results: Record<string, Status> = {};
  for (const type in healthCheckEndPoints) {
    results[type] = await healthCheck(healthCheckEndPoints[type] ?? "", url, logger);
  }
  return results;
};

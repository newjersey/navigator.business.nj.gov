import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError, AxiosResponse } from "axios";

type Status = "PASS" | "FAIL" | "ERROR";
type StatusResult = Record<string, Status>;

const healthCheckEndPoints: Record<string, string> = {
  self: "self",
  elevator: "dynamics/elevator",
  fireSafety: "dynamics/fire-safety",
  housing: "dynamics/housing",
  "dynamics-licenseStatus": "dynamics/license-status",
  "webservice-licenseStatus": "webservice/license-status",
  "webservice-formation": "webservice/formation",
};

const checkHealthCheck = async (type: string, logger: LogWriterType): Promise<Status> => {
  return axios
    .get(`https://dev.api.navigator.business.nj.gov/health/${type}`)
    .then((response: AxiosResponse) => {
      if (response.data.success === true) {
        logger.LogInfo(`Health Check Status - Endpoint: ${type}: PASS`);
        return "PASS";
      } else {
        logger.LogError(`Health Check Status - Endpoint: ${type}: FAIL`, response.data);
        logger.LogInfo(response.data);
        return "FAIL";
      }
    })
    .catch((error: AxiosError) => {
      logger.LogError(`Health Check Status - Endpoint: ${type}: ERROR`, error);
      return "ERROR";
    });
};

export const runHealthChecks = async (logger: LogWriterType): Promise<StatusResult> => {
  const results: Record<string, Status> = {};
  for (const type in healthCheckEndPoints) {
    results[type] = await checkHealthCheck(healthCheckEndPoints[type] ?? "", logger);
  }
  return results;
};

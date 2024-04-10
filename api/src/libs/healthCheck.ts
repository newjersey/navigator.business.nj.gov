import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError, AxiosResponse } from "axios";

type Status = "PASS" | "FAIL" | "ERROR";
type StatusResult = Record<string, Status>;

const healthCheckEndPoints: Record<string, string> = {
  self: "selfError",
  elevator: "dynamics/elevatorError",
  fireSafety: "dynamics/fire-safetyError",
  housing: "dynamics/housingError",
  dynamicsLicenseStatus: "dynamics/license-statusError",
  webserviceLicenseStatus: "webservice/license-statusError",
  webserviceFormation: "webservice/formationError",
};

const url =
  process.env.STAGE === "prod"
    ? "https://api.navigator.business.nj.gov"
    : "https://dev.api.navigator.business.nj.gov";

const healthCheck = async (type: string, logger: LogWriterType): Promise<Status> => {
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
  const results: Record<string, Status> = {};
  for (const type in healthCheckEndPoints) {
    results[type] = await healthCheck(healthCheckEndPoints[type] ?? "", logger);
  }
  return results;
};

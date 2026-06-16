import { EmployerRatesClient } from "@domain/types";
import { STAGE } from "@functions/config";
import { LogWriterType } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";
import { EmployerRatesRequest, EmployerRatesResponse } from "@shared/employerRates";
import axios, { AxiosError } from "axios";

export const WebserviceEmployerRatesClient = (logWriter: LogWriterType): EmployerRatesClient => {
  const getEmployerRates = async (
    employerRatesRequest: EmployerRatesRequest,
  ): Promise<EmployerRatesResponse> => {
    const baseUrl = await getConfigValue("boomi-runtime/alb-url");

    const url =
      STAGE === "prod"
        ? `${baseUrl}/ws/simple/queryDeptOfLaborEmployerRatesProd`
        : `${baseUrl}/ws/simple/queryDeptOfLaborEmployerRates`;

    const logId = logWriter.GetId();

    logWriter.LogInfo(
      `Webservice Employer Rates Client - Request Sent - Id:${logId} Url:${
        url
      } data:${JSON.stringify(employerRatesRequest)}`,
    );

    return axios
      .post(url, employerRatesRequest)
      .then((response) => {
        logWriter.LogInfo(
          `Webservice Employer Rates Client - Response Received - Id:${logId} Status:${
            response.status
          } StatusText:${response.statusText} Data:${JSON.stringify(response.data)}`,
        );
        return response.data;
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Webservice Employer Rates Client - Error - Id:${logId} Error:`, error);
        throw error.response?.status;
      });
  };

  return { getEmployerRates };
};

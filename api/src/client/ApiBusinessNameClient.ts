import axios, { AxiosError, AxiosResponse } from "axios";
import { BusinessNameClient, NameAvailability } from "../domain/types";
import { LogWriterType } from "../libs/logWriter";

export const ApiBusinessNameClient = (baseUrl: string, logWriter: LogWriterType): BusinessNameClient => {
  const search = (name: string): Promise<NameAvailability> => {
    const url = `${baseUrl}/Available?q=${name}`;
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Business Name Search - NICUSA - Id:${logId} - Request Sent to ${url}. Name: ${name}`);
    return axios
      .get(url)
      .then((response: AxiosResponse<ApiNameAvailabilityResponse>) => {
        logWriter.LogInfo(
          `Business Name Search - NICUSA - Id:${logId} -Response Received. Status: ${response.status} : ${
            response.statusText
          }. Data: ${JSON.stringify(response.data)}`
        );
        let responseStatus = "";
        if (response.data.Available) {
          responseStatus = "AVAILABLE";
        } else if (response.data.Reason.indexOf("business designators") > 0) {
          responseStatus = "DESIGNATOR";
        } else {
          responseStatus = "UNAVAILABLE";
        }
        return {
          status: responseStatus as "AVAILABLE" | "DESIGNATOR" | "UNAVAILABLE",
          similarNames: response.data.Similars,
        };
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Business Name Search - NICUSA - Id:${logId} -Error`, error);
        throw error.response?.status;
      });
  };

  return {
    search,
  };
};

export type ApiNameAvailabilityResponse = {
  Available: boolean;
  Reason: string;
  Similars: string[];
};

import { NameAvailabilityResponse, NameAvailabilityStatus } from "@shared/businessNameSearch";
import axios, { AxiosError, AxiosResponse } from "axios";
import { BusinessNameClient } from "../domain/types";

import { LogWriterType } from "../libs/logWriter";

export const ApiBusinessNameClient = (baseUrl: string, logWriter: LogWriterType): BusinessNameClient => {
  const search = (name: string): Promise<NameAvailabilityResponse> => {
    const url = `${baseUrl}/Available?q=${encodeURIComponent(name)}`;
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Business Name Search - NICUSA - Id:${logId} - Request Sent to ${url}. Name: ${name}`);
    return axios
      .get(url)
      .then((response: AxiosResponse<ApiNameAvailabilityResponse>) => {
        logWriter.LogInfo(
          `Business Name Search - NICUSA - Id:${logId} -Response Received. Status: ${response.status} : ${
            response.statusText
          }. Data: ${JSON.stringify(response.data)}`,
        );
        let responseStatus: NameAvailabilityStatus;
        let invalidWord;
        if (response.data.Available) {
          responseStatus = "AVAILABLE";
        } else if (response.data.Reason.indexOf("business designators") > 0) {
          responseStatus = "DESIGNATOR_ERROR";
        } else if (response.data.Reason.indexOf("restricted word") > 0) {
          responseStatus = "RESTRICTED_ERROR";
          invalidWord = (response.data.Reason.match(new RegExp(/'(.*?)'/g)) ?? [])[0]?.replaceAll("'", "");
        } else if (response.data.Reason.indexOf("invalid special character") > 0) {
          {
            responseStatus = "SPECIAL_CHARACTER_ERROR";
          }
        } else {
          responseStatus = "UNAVAILABLE";
        }
        return {
          status: responseStatus,
          invalidWord,
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

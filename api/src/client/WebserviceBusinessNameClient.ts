import axios, { AxiosError } from "axios";
import { BusinessNameClient } from "../domain/types";
import { LogWriterType } from "../libs/logWriter";

export const WebserviceBusinessNameClient = (
  baseUrl: string,
  logWriter: LogWriterType
): BusinessNameClient => {
  const search = (name: string): Promise<string[]> => {
    const url = `${baseUrl}/ws/simple/queryBusinessName`;
    logWriter.LogInfo(`Business Name Search - Request Sent. url: ${url}. Name: ${name}`);
    return axios
      .post(url, {
        businessName: name,
      })
      .then((response) => {
        logWriter.LogInfo(
          `Business Name Search - Response Received. Status: ${response.status} : ${response.statusText}. Data: ${response.data}`
        );
        return response.data || [];
      })
      .catch((error: AxiosError) => {
        logWriter.LogError("Business Name Search - Error", error);
        return Promise.reject(error.response?.status);
      });
  };

  return {
    search,
  };
};

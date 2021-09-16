import { BusinessNameClient } from "../domain/types";
import axios, { AxiosError } from "axios";
import { LogWriter } from "../libs/logWriter";

export const WebserviceBusinessNameClient = (baseUrl: string): BusinessNameClient => {
  const logWriter = LogWriter("us-east-1", "NavigatorWebService", "BusinessNameSearch");
  const search = (name: string): Promise<string[]> => {
    const url = `${baseUrl}/ws/simple/queryBusinessName`;
    logWriter.LogInfo(`Search - Request Sent. url: ${url}. Name: ${name}`);
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
        logWriter.LogError("Search - Error", error);
        return Promise.reject(error.response?.status);
      });
  };

  return {
    search,
  };
};

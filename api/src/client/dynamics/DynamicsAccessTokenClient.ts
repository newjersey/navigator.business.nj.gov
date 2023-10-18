import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError } from "axios";
import { AccessTokenClient } from "./types";

type Config = {
  tenantId: string;
  orgUrl: string;
  clientId: string;
  clientSecret: string;
};

export const DynamicsAccessTokenClient = (logWriter: LogWriterType, config: Config): AccessTokenClient => {
  const getAccessToken = async (): Promise<string> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Access Token Client - Id:${logId}`);

    return axios
      .postForm(`https://login.windows.net/${config.tenantId}/oauth2/token`, {
        grant_type: "client_credentials",
        resource: config.orgUrl,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      })
      .then((response) => {
        logWriter.LogInfo(`Dynamics Access Token Client - Id:${logId} - Response Status: ${response.status}`);
        return response.data.access_token || "";
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Access Token Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getAccessToken,
  };
};

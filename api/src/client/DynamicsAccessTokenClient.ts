import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError } from "axios";
import { AccessTokenClient } from "../domain/types";

export const DynamicsAccessTokenClient = (logWriter: LogWriterType): AccessTokenClient => {
  const getAccessToken = async (): Promise<string> => {
    const TENANT_ID = process.env.DCA_DYNAMICS_TENENT_ID;
    const ORG_URL = process.env.DCA_DYNAMICS_ORG_URL;
    const APPLICATION_ID = process.env.DCA_DYNAMICS_CLIENT_ID;
    const CLIENT_SECRET = process.env.DCA_DYNAMICS_SECRET;

    const logId = logWriter.GetId();

    logWriter.LogInfo(`Dynamics Access Token Client - Id:${logId}`);

    return axios
      .post(`https://login.windows.net/${TENANT_ID}/oauth2/token`, {
        grant_type: "client_credentials",
        resource: ORG_URL,
        client_id: APPLICATION_ID,
        client_secret: CLIENT_SECRET,
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

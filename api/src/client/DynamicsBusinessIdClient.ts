import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError } from "axios";
import { BusinessIdClient } from "../domain/types";

export const DynamicsBusinessIdClient = (logWriter: LogWriterType): BusinessIdClient => {
  const getBusinessId = async (accessToken: string, nameToSearch: string): Promise<string> => {
    const ORG_URL = process.env.DCA_DYNAMICS_ORG_URL;
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Business Id Client - Id:${logId}`);
    return axios
      .get(
        `${ORG_URL}/api/data/v9.2/accounts?$select=name,accountid&$filter=(contains(name, '${nameToSearch}'))&$top=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        logWriter.LogInfo(
          `Dynamics Business Id Client - Id:${logId} - Response: ${JSON.stringify(response.data)}`
        );
        return response.data.value ? response.data.value[0].accountid : "";
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Business Id Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getBusinessId,
  };
};

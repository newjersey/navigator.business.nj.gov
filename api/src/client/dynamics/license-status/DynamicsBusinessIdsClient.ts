import { BusinessIdClient } from "@client/dynamics/license-status/types";
import { NO_MATCH_ERROR } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError } from "axios";

export const DynamicsBusinessIdsClient = (logWriter: LogWriterType, orgUrl: string): BusinessIdClient => {
  const getMatchedBusinessIds = async (accessToken: string, nameToSearch: string): Promise<string[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Business Id Client - Id:${logId}`);
    return axios
      .get(
        `${orgUrl}/api/data/v9.2/accounts?$select=name,accountid&$filter=(contains(name, '${nameToSearch}'))&$top=50`,
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

        if (response.data.value.length === 0) throw new Error(NO_MATCH_ERROR);
        return response.data.value.map((idObj: BusinessIdResponse) => idObj.accountid);
      })
      .catch((error: AxiosError) => {
        if (error.message === NO_MATCH_ERROR) throw error;
        logWriter.LogError(`Dynamics Business Id Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getMatchedBusinessIds,
  };
};

type BusinessIdResponse = {
  name: string;
  accountid: string;
};

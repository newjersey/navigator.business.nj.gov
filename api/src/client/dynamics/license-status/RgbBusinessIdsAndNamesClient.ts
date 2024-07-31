import {
  BusinessIdAndName,
  BusinessIdsAndNamesClient,
} from "@client/dynamics/license-status/rgbLicenseStatusTypes";
import { NO_ADDRESS_MATCH_ERROR } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError } from "axios";

export const RgbBusinessIdsAndNamesClient = (
  logWriter: LogWriterType,
  orgUrl: string
): BusinessIdsAndNamesClient => {
  const getMatchedBusinessIdsAndNames = async (
    accessToken: string,
    nameToSearch: string
  ): Promise<BusinessIdAndName[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Rgb Business Ids And Names Client - Id:${logId}`);
    return axios
      .get(
        `${orgUrl}/api/data/v9.2/accounts?$select=name,accountid&$filter=(contains(name, '${nameToSearch}'))`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        logWriter.LogInfo(
          `Dynamics Business Ids And Names Client - Id:${logId} - Response: ${JSON.stringify(response.data)}`
        );

        if (response.data.value.length === 0) throw new Error(NO_ADDRESS_MATCH_ERROR);

        return response.data.value.map(
          (idObj: BusinessIdResponse): BusinessIdAndName => ({
            name: idObj.name,
            businessId: idObj.accountid,
          })
        );
      })
      .catch((error: AxiosError) => {
        if (error.message === NO_ADDRESS_MATCH_ERROR) throw error;
        logWriter.LogError(`Dynamics Business Ids And Names Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getMatchedBusinessIdsAndNames,
  };
};

type BusinessIdResponse = {
  name: string;
  accountid: string;
};

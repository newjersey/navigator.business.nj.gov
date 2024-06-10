import {
  HousingPropertyInterest,
  HousingPropertyInterestClient,
  HousingPropertyInterestResponse,
} from "@client/dynamics/housing/types";
import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError } from "axios";

export const DynamicsHousingPropertyInterestClient = (
  logWriter: LogWriterType,
  orgUrl: string
): HousingPropertyInterestClient => {
  const getPropertyInterest = async (
    accessToken: string,
    address: string,
    municipalityId: string
  ): Promise<HousingPropertyInterestResponse> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Housing Property Interest Client - Id:${logId}`);

    return axios
      .get(
        `${orgUrl}/api/data/v9.2/ultra_propertyinterests?$select=createdon,ultra_isfiresafetyproperty,ultra_isbhiregisteredproperty,ultra_streetaddress,ultra_zipcode,ultra_bhinextinspectiondue_date,ultra_bhinextreinspectiondue_state,statecode,ultra_buildingcount&$filter=(ultra_streetaddress eq '${address}' and _ultra_municipality_value eq '${municipalityId}')&$top=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        logWriter.LogInfo(
          `Dynamics Housing Property Interest Client - Id:${logId} - Response: ${JSON.stringify(
            response.data
          )}`
        );
        const value = response.data.value as Array<DynamicsHousingPropertyInterestResponse>;
        if (value.length === 0) {
          return;
        }
        return processDynamicsPropertyInterestResponse(value[0]);
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Housing Property Interest - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getPropertyInterest: getPropertyInterest,
  };
};

function processDynamicsPropertyInterestResponse(
  response: DynamicsHousingPropertyInterestResponse
): HousingPropertyInterest {
  return {
    createdOn: response.createdon,
    isFireSafety: response.ultra_isfiresafetyproperty,
    isBHIRegistered: response.ultra_isbhiregisteredproperty,
    address: response.ultra_streetaddress,
    BHINextInspectionDueDate: response.ultra_bhinextinspectiondue_date,
    stateCode: response.statecode,
    id: response.ultra_propertyinterestid,
    buildingCount: response.ultra_buildingcount,
  };
}

type DynamicsHousingPropertyInterestResponse = {
  createdon: string;
  ultra_isfiresafetyproperty: boolean;
  ultra_isbhiregisteredproperty: boolean;
  ultra_streetaddress: string;
  ultra_zipcode: string;
  ultra_bhinextinspectiondue_date: string;
  statecode: number;
  ultra_propertyinterestid: string;
  ultra_buildingcount: number;
};

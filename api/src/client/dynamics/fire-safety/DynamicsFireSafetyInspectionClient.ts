import { LogWriterType } from "@libs/logWriter";
import { FireSafetyInspection } from "./types";
import axios, { AxiosError } from "axios";


export interface FireSafetyInspectionClient {
  getFireSafetyInspectionsByAddress: (
    accessToken: string,
    address: string
  ) => Promise<FireSafetyInspection[]>;
}
export const DynamicsFireSafetyInspectionClient = (
  logWriter: LogWriterType,
  orgUrl: string
): FireSafetyInspectionClient => {
  const getFireSafetyInspectionsByAddress = async (
    accessToken: string,
    address: string
  ): Promise<FireSafetyInspection[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Business Address Client - Id:${logId}`);

    return axios
      .get(
        `${orgUrl}/api/data/v9.2/rgb_addresses?$select=createdon,ultra_inspectionended,ultra_numberofopenviolations,ultra_streetaddress&$filter=(ultra_streetaddress eq ${address})&$top=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        logWriter.LogInfo(
          `Dynamics Fire Safety Client - Id:${logId} - Response: ${JSON.stringify(response.data)}`
        );
        return response.data.value.map((response: DynamicsFireSafetyInspectionResponse) => {
          return {
            createdOn: response.createdon,
            inspectionFinished: response.ultra_inspectionended,
            address: response.ultra_streetaddress,
            openViolationCount: response.ultra_numberofopenviolations
          }
        })
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Fire Safety - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getFireSafetyInspectionsByAddress,
  };
};

type DynamicsFireSafetyInspectionResponse = {
  createdon: string;
  ultra_inspectionended: boolean;
  ultra_numberofopenviolations: number;
  ultra_streetaddress: string;
};


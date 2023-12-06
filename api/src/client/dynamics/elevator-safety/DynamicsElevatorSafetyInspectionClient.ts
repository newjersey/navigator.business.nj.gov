import { ElevatorInspection, ElevatorSafetyInspectionClient } from "@client/dynamics/elevator-safety/types";
import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError } from "axios";

export const DynamicsElevatorSafetyInspectionClient = (
  logWriter: LogWriterType,
  orgUrl: string
): ElevatorSafetyInspectionClient => {
  const getElevatorInspections = async (
    accessToken: string,
    address: string
  ): Promise<ElevatorInspection[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Elevator Inspection Client - Id:${logId}`);

    return axios
      .get(
        `${orgUrl}/api/data/v9.2/ultra_elsainspections?$select=createdon,statecode,ultra_devicecount,ultra_buildingstreetaddress&$filter=(ultra_buildingstreetaddress eq '${address}')&$top=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        logWriter.LogInfo(
          `Dynamics Elevator Safety Inspection Client - Id:${logId} - Response: ${JSON.stringify(
            response.data
          )}`
        );
        return response.data.value.map((element: DynamicsElevatorSafetyInspectionResponse) =>
          processDynamicsElevatorSafetyInspectionResponse(element)
        );
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Elevator Safety Inspection - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getElevatorInspections,
  };
};

function processDynamicsElevatorSafetyInspectionResponse(
  response: DynamicsElevatorSafetyInspectionResponse
): ElevatorInspection {
  return {
    deviceCount: response.ultra_devicecount,
    date: response.createdon,
    address: response.ultra_buildingstreetaddress,
    stateCode: response.statecode,
  };
}

type DynamicsElevatorSafetyInspectionResponse = {
  createdon: string;
  ultra_buildingstreetaddress: string;
  ultra_devicecount: number;
  statecode: number;
};

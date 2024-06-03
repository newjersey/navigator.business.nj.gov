import { ElevatorSafetyViolationsClient } from "@client/dynamics/elevator-safety/types";
import { LogWriterType } from "@libs/logWriter";
import { ElevatorSafetyViolation } from "@shared/elevatorSafety";
import axios, { AxiosError } from "axios";

export const DynamicsElevatorSafetyViolationsClient = (
  logWriter: LogWriterType,
  orgUrl: string
): ElevatorSafetyViolationsClient => {
  const getViolationsForPropertyInterest = async (
    accessToken: string,
    address: string,
    municipalityId: string
  ): Promise<Record<string, ElevatorSafetyViolation[]>> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Elevator Violations Client - Id:${logId}`);
    const deviceViolationMap: Record<string, ElevatorSafetyViolation[]> = {}

    await axios
      .get(
        `${orgUrl}/api/data/v9.2/ultra_buildings?$select=ultra_buildingid&$filter=(ultra_name eq '${address}' and _ultra_municipality_value eq '${municipalityId}')`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(async (response) => {
        let deviceInspections: DynamicsElevatorSafetyDeviceInspectionResponse[] = [];
        await Promise.all(
          response.data.value.map(async (element: DynamicsElevatorSafetyBuildingResponse) => {
            await axios
              .get(
                `${orgUrl}/api/data/v9.2/ultra_elsadeviceinspections?$filter=(_ultra_building_value eq '${element.ultra_buildingid}')`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              )
              .then((response) => {
                const inspections = response.data.value as DynamicsElevatorSafetyDeviceInspectionResponse[];
                deviceInspections = [...deviceInspections, ...inspections]
              })
              .catch((error: AxiosError) => {
                throw error.response?.status;
              });
          })
        );

        await Promise.all(
          deviceInspections.map(async (element) => {
            await axios
              .get(
                `${orgUrl}/api/data/v9.2/ultra_elsacitations?$filter=(_ultra_deviceinspection_value eq ${element.ultra_elsadeviceinspectionid})`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              )
              .then((response) => {
                const violationsResponse = response.data.value as DynamicsElevatorSafetyViolationResponse[];
                const violationsForDevice: ElevatorSafetyViolation[] = []
                violationsResponse.map((violation) => {
                  const formattedViolation = processDynamicsElevatorSafetyViolationResponse(violation);
                  violationsForDevice.push(formattedViolation);
                });
                if (violationsForDevice.length > 0) {
                  deviceViolationMap[element.ultra_buildingdeviceid] = violationsForDevice
                }

              })
              .catch((error: AxiosError) => {
                throw error.response?.status;
              });
          })
        );
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Elevator Safety Violation - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });

    return deviceViolationMap;
  };

  return {
    getViolationsForPropertyInterest,
  };
};

function processDynamicsElevatorSafetyViolationResponse(
  response: DynamicsElevatorSafetyViolationResponse
): ElevatorSafetyViolation {
  return {
    isOpen: response.statusCode === 1,
    citationDate: response.ultra_citationdate,
    inspectorRemarks: response.ultra_remarks
  };
}

type DynamicsElevatorSafetyBuildingResponse = {
  _ultra_propertyinterest_value: string;
  ultra_buildingid: string;
};

type DynamicsElevatorSafetyDeviceInspectionResponse = {
  _ultra_building_value: string;
  ultra_elsadeviceinspectionid: string;
  ultra_buildingdeviceid: string;
};

type DynamicsElevatorSafetyViolationResponse = {
  statusCode: number;
  ultra_citationdate: string;
  ultra_remarks: string;
};

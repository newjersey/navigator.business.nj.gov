import type { ElevatorSafetyViolationsClient } from "@client/dynamics/elevator-safety/types";
import type { LogWriterType } from "@libs/logWriter";
import type { ElevatorSafetyViolation } from "@shared/elevatorSafety";
import axios, { type AxiosError } from "axios";

export const DynamicsElevatorSafetyViolationsClient = (
  logWriter: LogWriterType,
  orgUrl: string,
): ElevatorSafetyViolationsClient => {
  const getViolationsForPropertyInterest = async (
    accessToken: string,
    address: string,
    municipalityId: string,
  ): Promise<boolean> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Elevator Violations Client - Id:${logId}`);
    let hasViolations = false;

    await axios
      .get(
        `${orgUrl}/api/data/v9.2/ultra_buildings?$select=ultra_buildingid&$filter=(ultra_name eq '${address}' and _ultra_municipality_value eq '${municipalityId}')`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      .then(async (response) => {
        const deviceInspectionIds: string[] = [];
        await Promise.all(
          response.data.value.map(async (element: DynamicsElevatorSafetyBuildingResponse) => {
            try {
              const response = await axios.get(
                `${orgUrl}/api/data/v9.2/ultra_elsadeviceinspections?$filter=(_ultra_building_value eq '${element.ultra_buildingid}')`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                },
              );
              const inspections = response.data
                .value as DynamicsElevatorSafetyDeviceInspectionResponse[];
              for (const inspection of inspections) {
                deviceInspectionIds.push(inspection.ultra_elsadeviceinspectionid);
              }
            } catch (error) {
              throw (error as AxiosError).response?.status;
            }
          }),
        );

        const violations: ElevatorSafetyViolation[] = [];
        await Promise.all(
          deviceInspectionIds.map(async (element) => {
            try {
              const response = await axios.get(
                `${orgUrl}/api/data/v9.2/ultra_elsacitations?$filter=(_ultra_deviceinspection_value eq ${element})`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                },
              );
              const violationsResponse = response.data
                .value as DynamicsElevatorSafetyViolationResponse[];
              violationsResponse.map((violation) => {
                const formattedViolation =
                  processDynamicsElevatorSafetyViolationResponse(violation);
                violations.push(formattedViolation);
              });
            } catch (error) {
              throw (error as AxiosError).response?.status;
            }
          }),
        );

        hasViolations = violations.length > 0;
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Elevator Safety Violation - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });

    return hasViolations;
  };

  return {
    getViolationsForPropertyInterest,
  };
};

function processDynamicsElevatorSafetyViolationResponse(
  response: DynamicsElevatorSafetyViolationResponse,
): ElevatorSafetyViolation {
  return {
    isOpen: response.statusCode === 1,
    citationDate: response.ultra_citationdate,
  };
}

type DynamicsElevatorSafetyBuildingResponse = {
  _ultra_propertyinterest_value: string;
  ultra_buildingid: string;
};

type DynamicsElevatorSafetyDeviceInspectionResponse = {
  _ultra_building_value: string;
  ultra_elsadeviceinspectionid: string;
};

type DynamicsElevatorSafetyViolationResponse = {
  statusCode: number;
  ultra_citationdate: string;
};

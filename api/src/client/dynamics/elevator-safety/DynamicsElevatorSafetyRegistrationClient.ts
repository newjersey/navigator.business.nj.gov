import {
  ElevatorRegistration,
  ElevatorRegistrationStatus,
  ElevatorSafetyRegistrationClient,
} from "@client/dynamics/elevator-safety/types";
import { LogWriterType } from "@libs/logWriter";
import { parseDate } from "@shared/dateHelpers";
import axios, { AxiosError } from "axios";

export const DynamicsElevatorSafetyRegistrationClient = (
  logWriter: LogWriterType,
  orgUrl: string
): ElevatorSafetyRegistrationClient => {
  const getElevatorRegistrationsForBuilding = async (
    accessToken: string,
    propertyInterestId: string
  ): Promise<ElevatorRegistration[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Elevator Registration Client - Id:${logId}`);

    return axios
      .get(
        `${orgUrl}/api/data/v9.2/ultra_elevatorregistrationrequests?$select=createdon,statecode,statuscode&$filter=(_ultra_propertyinterest_value eq '${propertyInterestId}')`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(async (response) => {
        logWriter.LogInfo(
          `Dynamics Elevator Safety Registration Client - Id:${logId} - Response: ${JSON.stringify(
            response.data
          )}`
        );
        return await Promise.all(
          response.data.value.map(async (element: DynamicsElevatorSafetyRegistrationResponse) => {
            const deviceCount = await axios
              .get(
                `${orgUrl}/api/data/v9.2/ultra_elevatordeviceregistrationrequests?$filter=(_ultra_registrationrequestid_value eq ${element.ultra_elevatorregistrationrequestid})`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              )
              .then((response) => {
                return response.data.value.length;
              })
              .catch((error: AxiosError) => {
                throw error.response?.status;
              });
            return processDynamicsElevatorSafetyRegistrationResponse(element, deviceCount);
          })
        );
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Elevator Safety Registration Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getElevatorRegistrationsForBuilding,
  };
};

function processDynamicsElevatorSafetyRegistrationResponse(
  response: DynamicsElevatorSafetyRegistrationResponse,
  deviceCount: number
): ElevatorRegistration {
  return {
    deviceCount: deviceCount,
    dateStarted: parseDate(response.createdon).format("MM/DD/YYYY").toString(),
    status: getStatusFromStatusCode(response.statuscode),
  };
}

function getStatusFromStatusCode(statusCode: string): ElevatorRegistrationStatus {
  switch (String(statusCode)) {
    case "1":
      return "In Review";
    case "2":
      return "Cancelled";
    case "240000000":
      return "Returned";
    case "240000001":
      return "Approved";
    case "240000002":
      return "Rejected";
    case "240000003":
      return "Incomplete";
    default:
      return "UNRECOGNIZED STATUS";
  }
}

type DynamicsElevatorSafetyRegistrationResponse = {
  ultra_buildingaddressline1: string;
  _ultra_propertyinterest_value: string;
  createdon: string;
  ultra_elevatorregistrationrequestid: string;
  statuscode: string;
};

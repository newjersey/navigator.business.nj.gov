import {
  getPropertyInterestTypeIntegerFromTitle,
  HotelMotelRegistrationClient,
  HousingRegistrationRequest,
  HousingRegistrationRequestResponse,
  HousingRegistrationStatus,
} from "@client/dynamics/housing/types";
import { LogWriterType } from "@libs/logWriter";
import { parseDate } from "@shared/dateHelpers";
import axios, { AxiosError } from "axios";

export const DynamicsHotelMotelRegistrationClient = (
  logWriter: LogWriterType,
  orgUrl: string
): HotelMotelRegistrationClient => {
  const getHotelMotelRegistration = async (
    accessToken: string,
    propertyInterestId: string,
    buildingCount: number
  ): Promise<HousingRegistrationRequestResponse> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Hotel Motel Registration Client - Id:${logId}`);
    const hotelPropertyInterestType = getPropertyInterestTypeIntegerFromTitle("Hotel");
    const motelPropertyInterestType = getPropertyInterestTypeIntegerFromTitle("Motel");

    return axios
      .get(
        `${orgUrl}/api/data/v9.2/ultra_bhiregistrationrequests?$select=ultra_bhiregistrationrequestid,ultra_requestdate,statuscode,ultra_propertyinteresttype&$filter=(_ultra_linktoexistingpropertyinterest_value eq '${propertyInterestId}' and (ultra_propertyinteresttype eq ${hotelPropertyInterestType} or ultra_propertyinteresttype eq ${motelPropertyInterestType}))`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        logWriter.LogInfo(
          `Dynamics Hotel Motel Registration Client - Id:${logId} - Response: ${JSON.stringify(
            response.data
          )}`
        );
        const value = response.data.value as Array<DynamicsHotelMotelRegistrationResponse>;
        if (value.length === 0) {
          return [];
        }
        const registrations = value.map((registration) =>
          processDynamicsHotelMotelRegistrationResponse(registration, buildingCount)
        );
        const sortedRegistrations = registrations.sort((a, b) => {
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          if (dateA.isAfter(dateB)) {
            return -1;
          }
          return 1;
        });
        return sortedRegistrations;
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Hotel Motel Registration Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });

    return [];
  };

  return {
    getHotelMotelRegistration: getHotelMotelRegistration,
  };
};

function processDynamicsHotelMotelRegistrationResponse(
  response: DynamicsHotelMotelRegistrationResponse,
  buildingCount: number
): HousingRegistrationRequest {
  return {
    id: response.ultra_bhiregistrationrequestid,
    date: response.ultra_requestdate,
    status: getStatusFromStatusCode(response.statuscode),
    propertyInterestType: response.ultra_propertyinteresttype,
    buildingCount: buildingCount,
  };
}

type DynamicsHotelMotelRegistrationResponse = {
  ultra_bhiregistrationrequestid: string;
  ultra_requestdate: string;
  statuscode: string;
  ultra_propertyinteresttype: number;
};

function getStatusFromStatusCode(statusCode: string): HousingRegistrationStatus {
  switch (String(statusCode)) {
    case "1":
      return "In Review";
    case "100000003":
      return "Cancelled";
    case "240000000":
      return "Returned";
    case "2":
      return "Approved";
    case "100000002":
      return "Rejected";
    case "240000003":
      return "Incomplete";
    default:
      return "UNRECOGNIZED STATUS";
  }
}

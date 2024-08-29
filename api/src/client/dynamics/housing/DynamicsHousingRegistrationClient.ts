import {
  getPropertyInterestTypeIntegerFromTitle,
  HousingRegistrationClient,
  HousingRegistrationRequest,
  HousingRegistrationRequestResponse,
  HousingRegistrationStatus,
} from "@client/dynamics/housing/types";
import { LogWriterType } from "@libs/logWriter";
import { parseDate } from "@shared/dateHelpers";
import { PropertyInterestType } from "@shared/housing";
import axios, { AxiosError } from "axios";

export const DynamicsHousingRegistrationClient = (
  logWriter: LogWriterType,
  orgUrl: string
): HousingRegistrationClient => {
  const getHousingRegistration = async (
    accessToken: string,
    propertyInterestId: string,
    buildingCount: number,
    propertyInterestType: PropertyInterestType
  ): Promise<HousingRegistrationRequestResponse> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Hotel Motel Registration Client - Id:${logId}`);
    let propertyInterestTypeFilter = "";

    switch (propertyInterestType) {
      case "hotelMotel":
        propertyInterestTypeFilter = ` and (ultra_propertyinteresttype eq ${getPropertyInterestTypeIntegerFromTitle(
          "Hotel"
        )} or ultra_propertyinteresttype eq ${getPropertyInterestTypeIntegerFromTitle("Motel")})`;
        break;
      case "multipleDwelling":
        propertyInterestTypeFilter = ` and (ultra_propertyinteresttype eq ${getPropertyInterestTypeIntegerFromTitle(
          "Multiple Dwelling"
        )})`;
        break;
    }

    return axios
      .get(
        `${orgUrl}/api/data/v9.2/ultra_bhiregistrationrequests?$select=ultra_bhiregistrationrequestid,ultra_requestdate,statuscode,ultra_propertyinteresttype&$filter=(_ultra_linktoexistingpropertyinterest_value eq '${propertyInterestId}'${propertyInterestTypeFilter})`,
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
        const value = response.data.value as Array<DynamicsHousingRegistrationResponse>;
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
        return sortedRegistrations.slice(0, 1);
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Hotel Motel Registration Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getHousingRegistration: getHousingRegistration,
  };
};

function processDynamicsHotelMotelRegistrationResponse(
  response: DynamicsHousingRegistrationResponse,
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

type DynamicsHousingRegistrationResponse = {
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

import {
  HousingPropertyInterestClient,
  HousingRegistrationClient,
  HousingRegistrationRequestLookupResponse,
} from "@client/dynamics/housing/types";
import { AccessTokenClient } from "@client/dynamics/types";
import { PropertyInterestType } from "@shared/housing";

type Config = {
  accessTokenClient: AccessTokenClient;
  housingHousingRegistrationClient: HousingRegistrationClient;
  housingPropertyInterestClient: HousingPropertyInterestClient;
};

export const DynamicsHousingRegistrationStatusClient = (
  config: Config
): ((
  address: string,
  municipalityId: string,
  propertyInterestType: PropertyInterestType
) => Promise<HousingRegistrationRequestLookupResponse>) => {
  return async (
    address: string,
    municipalityId: string,
    propertyInterestType: PropertyInterestType
  ): Promise<HousingRegistrationRequestLookupResponse> => {
    const accessToken = await config.accessTokenClient.getAccessToken();
    const propertyInterest = await config.housingPropertyInterestClient.getPropertyInterest(
      accessToken,
      address,
      municipalityId
    );

    if (!propertyInterest) {
      return {
        registrations: [],
        lookupStatus: "NO PROPERTY INTERESTS FOUND",
      };
    }

    const registrations = await config.housingHousingRegistrationClient.getHousingRegistration(
      accessToken,
      propertyInterest.id,
      propertyInterest.buildingCount,
      propertyInterestType
    );

    if (!registrations || registrations.length === 0) {
      return {
        registrations: [],
        lookupStatus: "NO REGISTRATIONS FOUND",
      };
    }
    return {
      registrations: registrations,
      lookupStatus: "SUCCESSFUL",
      renewalDate: propertyInterest.BHINextInspectionDueDate || "",
    };
  };
};

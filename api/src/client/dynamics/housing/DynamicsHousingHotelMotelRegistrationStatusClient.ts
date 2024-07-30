import {
  HotelMotelRegistrationClient,
  HousingPropertyInterestClient,
  HousingRegistrationRequestLookupResponse,
} from "@client/dynamics/housing/types";
import { AccessTokenClient } from "@client/dynamics/types";
import { LogWriterType } from "@libs/logWriter";

type Config = {
  accessTokenClient: AccessTokenClient;
  housingHotelMotelRegistrationClient: HotelMotelRegistrationClient;
  housingPropertyInterestClient: HousingPropertyInterestClient;
};

export const DynamicsHotelMotelRegistrationStatusClient = (
  logWriter: LogWriterType,
  config: Config
): ((address: string, municipalityId: string) => Promise<HousingRegistrationRequestLookupResponse>) => {
  return async (
    address: string,
    municipalityId: string
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

    const registrations = await config.housingHotelMotelRegistrationClient.getHotelMotelRegistration(
      accessToken,
      propertyInterest.id,
      propertyInterest.buildingCount
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
    };
  };
};

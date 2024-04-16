import {
  ElevatorRegistrationSummary,
  ElevatorSafetyRegistrationClient,
} from "@client/dynamics/elevator-safety/types";
import { HousingPropertyInterestClient } from "@client/dynamics/housing/types";
import { AccessTokenClient } from "@client/dynamics/types";
import { ElevatorSafetyRegistrationStatus } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";

type Config = {
  accessTokenClient: AccessTokenClient;
  elevatorRegistrationClient: ElevatorSafetyRegistrationClient;
  housingPropertyInterestClient: HousingPropertyInterestClient;
  housingAccessTokenClient: AccessTokenClient;
};

export const DynamicsElevatorSafetyRegistrationStatusClient = (
  logWriter: LogWriterType,
  config: Config
): ElevatorSafetyRegistrationStatus => {
  return async (address: string, municipalityId: string): Promise<ElevatorRegistrationSummary> => {
    const accessToken = await config.accessTokenClient.getAccessToken();
    const housingAccessToken = await config.housingAccessTokenClient.getAccessToken();

    const propertyInterest = await config.housingPropertyInterestClient.getPropertyInterest(
      housingAccessToken,
      address,
      municipalityId
    );

    if (!propertyInterest?.id) {
      return {
        registrations: [],
        lookupStatus: "NO PROPERTY INTERESTS FOUND",
      };
    }

    const registrations = await config.elevatorRegistrationClient.getElevatorRegistrationsForBuilding(
      accessToken,
      propertyInterest?.id
    );

    if (registrations.length === 0) {
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

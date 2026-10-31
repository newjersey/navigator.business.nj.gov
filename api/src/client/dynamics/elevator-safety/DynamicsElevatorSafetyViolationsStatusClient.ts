import type { ElevatorSafetyViolationsClient } from "@client/dynamics/elevator-safety/types";
import type { AccessTokenClient } from "@client/dynamics/types";
import type { ElevatorSafetyViolationsStatus } from "@domain/types";

type Config = {
  accessTokenClient: AccessTokenClient;
  elevatorSafetyViolationsClient: ElevatorSafetyViolationsClient;
};

export const DynamicsElevatorSafetyViolationsStatusClient = (
  config: Config,
): ElevatorSafetyViolationsStatus => {
  return async (address: string, municipalityId: string): Promise<boolean> => {
    const accessToken = await config.accessTokenClient.getAccessToken();
    return await config.elevatorSafetyViolationsClient.getViolationsForPropertyInterest(
      accessToken,
      address,
      municipalityId,
    );
  };
};

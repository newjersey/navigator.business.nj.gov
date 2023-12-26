import { ElevatorSafetyInspectionClient } from "@client/dynamics/elevator-safety/types";
import { AccessTokenClient } from "@client/dynamics/types";
import { HealthCheckMethod, HealthCheckResponse } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";

type Config = {
  accessTokenClient: AccessTokenClient;
  elevatorSafetyInspectionClient: ElevatorSafetyInspectionClient;
};

export const DynamicsElevatorSafetyHealthCheckClient = (
  logWriter: LogWriterType,
  config: Config
): HealthCheckMethod => {
  return async (): Promise<HealthCheckResponse> => {
    const accessToken = await config.accessTokenClient.getAccessToken();
    return await config.elevatorSafetyInspectionClient.getAnyElevatorInspections(accessToken);
  };
};

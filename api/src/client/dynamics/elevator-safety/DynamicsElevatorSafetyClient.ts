import {
  ElevatorInspection,
  ElevatorSafetyInspectionClient,
  ElevatorSafetyInspectionInfo,
} from "@client/dynamics/elevator-safety/types";
import { AccessTokenClient } from "@client/dynamics/types";
import { LogWriterType } from "@libs/logWriter";

type Config = {
  accessTokenClient: AccessTokenClient;
  elevatorSafetyInspectionClient: ElevatorSafetyInspectionClient;
};

export const DynamicsElevatorSafetyClient = (
  logWriter: LogWriterType,
  config: Config
): ElevatorSafetyInspectionInfo => {
  return async (address: string): Promise<ElevatorInspection[]> => {
    const accessToken = await config.accessTokenClient.getAccessToken();

    return await config.elevatorSafetyInspectionClient.getElevatorInspections(accessToken, address);
  };
};

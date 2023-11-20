import {
  FireSafetyInfo,
  FireSafetyInspection,
  FireSafetyInspectionClient,
} from "@client/dynamics/fire-safety/types";
import { AccessTokenClient } from "@client/dynamics/types";
import { LogWriterType } from "@libs/logWriter";

type Config = {
  accessTokenClient: AccessTokenClient;
  fireSafetyInspectionClient: FireSafetyInspectionClient;
};

export const DynamicsFireSafetyClient = (logWriter: LogWriterType, config: Config): FireSafetyInfo => {
  return async (address: string): Promise<FireSafetyInspection[]> => {
    const accessToken = await config.accessTokenClient.getAccessToken();

    return await config.fireSafetyInspectionClient.getFireSafetyInspectionsByAddress(accessToken, address);
  };
};

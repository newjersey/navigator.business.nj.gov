import type {
  FireSafetyInfo,
  FireSafetyInspection,
  FireSafetyInspectionClient,
} from "@client/dynamics/fire-safety/types";
import type { AccessTokenClient } from "@client/dynamics/types";
import type { LogWriterType } from "@libs/logWriter";

type Config = {
  accessTokenClient: AccessTokenClient;
  fireSafetyInspectionClient: FireSafetyInspectionClient;
};

export const DynamicsFireSafetyClient = (
  _logWriter: LogWriterType,
  config: Config,
): FireSafetyInfo => {
  return async (address: string): Promise<FireSafetyInspection[]> => {
    const accessToken = await config.accessTokenClient.getAccessToken();

    return await config.fireSafetyInspectionClient.getFireSafetyInspections(accessToken, address);
  };
};

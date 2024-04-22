import {
  HousingPropertyInterestClient,
  HousingPropertyInterestInfo,
  HousingPropertyInterestResponse,
} from "@client/dynamics/housing/types";
import { AccessTokenClient } from "@client/dynamics/types";
import { LogWriterType } from "@libs/logWriter";

type Config = {
  accessTokenClient: AccessTokenClient;
  housingPropertyInterestClient: HousingPropertyInterestClient;
};

export const DynamicsHousingClient = (
  logWriter: LogWriterType,
  config: Config
): HousingPropertyInterestInfo => {
  return async (address: string, municipalityId: string): Promise<HousingPropertyInterestResponse> => {
    const accessToken = await config.accessTokenClient.getAccessToken();

    return await config.housingPropertyInterestClient.getPropertyInterest(
      accessToken,
      address,
      municipalityId
    );
  };
};

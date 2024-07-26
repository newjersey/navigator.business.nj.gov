import type { AccessTokenClient } from "@client/dynamics/types";
import type { HealthCheckMetadata, HealthCheckMethod } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import axios, { type AxiosError } from "axios";
import { ReasonPhrases } from "http-status-codes";

type Config = {
  accessTokenClient: AccessTokenClient;
  orgUrl: string;
};

export const RgbLicenseHealthCheckClient = (logWriter: LogWriterType, config: Config): HealthCheckMethod => {
  return async (): Promise<HealthCheckMetadata> => {
    const logId = logWriter.GetId();
    const accessToken = await config.accessTokenClient.getAccessToken();
    return axios
      .get(`${config.orgUrl}/api/data/v9.2/accounts?$top=1`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        return {
          success: true,
          data: {
            message: ReasonPhrases.OK,
          },
        } as HealthCheckMetadata;
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics License Status Health Check Failed - Id:${logId} - Error:`, error);
        if (error.response) {
          return {
            success: false,
            error: {
              serverResponseBody: error.message,
              serverResponseCode: error.response.status,
              message: ReasonPhrases.BAD_GATEWAY,
              timeout: false,
            },
          } as HealthCheckMetadata;
        }
        return {
          success: false,
          error: {
            message: ReasonPhrases.GATEWAY_TIMEOUT,
            timeout: true,
          },
        } as HealthCheckMetadata;
      });
  };
};

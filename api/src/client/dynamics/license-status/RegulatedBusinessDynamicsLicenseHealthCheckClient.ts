import type { AccessTokenClient } from "@client/dynamics/types";
import type { HealthCheckMetadata, HealthCheckMethod } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import axios, { type AxiosError } from "axios";
import { ReasonPhrases } from "http-status-codes";

type Config = {
  accessTokenClient: AccessTokenClient;
  orgUrl: string;
};

export const RegulatedBusinessDynamicsLicenseHealthCheckClient = (
  logWriter: LogWriterType,
  config: Config,
): HealthCheckMethod => {
  return async (): Promise<HealthCheckMetadata> => {
    const logId = logWriter.GetId();
    try {
      logWriter.LogInfo(
        `RGB Dynamics License Status Health Check - Id:${logId} - Request Sent to ${config.orgUrl}/api/data/v9.2/accounts?$top=1`,
      );
      const accessToken = await config.accessTokenClient.getAccessToken();

      if (!accessToken) {
        logWriter.LogError(`RGB Dynamics - Access token is undefined. Skipping request.`);
        return {
          success: false,
          error: {
            message: ReasonPhrases.UNAUTHORIZED,
            timeout: false,
          },
        };
      }
      const response = await axios.get(`${config.orgUrl}/api/data/v9.2/accounts?$top=1`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      logWriter.LogInfo(
        `RGB Dynamics License Status Health Check - Id:${logId} - Response received: ${JSON.stringify(
          response.data,
        )}`,
      );
      return {
        success: true,
        data: {
          message: ReasonPhrases.OK,
        },
      } as HealthCheckMetadata;
    } catch (error) {
      const axiosError = error as AxiosError;
      logWriter.LogError(
        `RGB Dynamics License Status Health Check Failed - Id:${logId} - Error: ${axiosError.message}`,
        axiosError,
      );
      if (axiosError.response) {
        logWriter.LogError(
          `RGB Dynamics License Status Health Check - Id:${logId} - Received error response: Status ${
            axiosError.response.status
          }, Body: ${JSON.stringify(axiosError.response.data)}`,
        );

        return {
          success: false,
          error: {
            serverResponseBody: axiosError.message,
            serverResponseCode: axiosError.response.status,
            message: ReasonPhrases.BAD_GATEWAY,
            timeout: false,
          },
        } as HealthCheckMetadata;
      }
      logWriter.LogError(
        `RGB Dynamics License Status Health Check - Id:${logId} -No response received, likely a timeout.`,
      );
      return {
        success: false,
        error: {
          message: ReasonPhrases.GATEWAY_TIMEOUT,
          timeout: true,
        },
      } as HealthCheckMetadata;
    }
  };
};

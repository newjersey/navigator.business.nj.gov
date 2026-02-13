import type { HealthCheckMetadata, HealthCheckMethod } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import axios from "axios";
import { ReasonPhrases } from "http-status-codes";

type Config = {
  orgUrl: string;
};

export const XrayRegistrationHealthCheckClient = (
  logWriter: LogWriterType,
  config: Config,
): HealthCheckMethod => {
  return async (): Promise<HealthCheckMetadata> => {
    const logId = logWriter.GetId();

    const addressURL = `${config.orgUrl}/xray_by_address?partialaddr=PENN STREET&zip=08103`;
    const nameURL = `${config.orgUrl}/xray_by_business_name?namepart=RUTGERS UNIVERSITY`;

    return Promise.all([axios.get(addressURL), axios.get(nameURL)])
      .then(() => {
        return {
          success: true,
          data: {
            message: ReasonPhrases.OK,
          },
        } as HealthCheckMetadata;
      })
      .catch((error) => {
        logWriter.LogError(`Xray Registration Health Check Failed - Id:${logId} - Error:`, error);
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

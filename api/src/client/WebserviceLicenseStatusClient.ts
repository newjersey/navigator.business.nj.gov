import { HealthCheckMetadata, HealthCheckMethod, LicenseStatusClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { LicenseEntity } from "@shared/license";
import axios, { AxiosError } from "axios";
import { ReasonPhrases } from "http-status-codes";

export const WebserviceLicenseStatusClient = (
  baseUrl: string,
  logWriter: LogWriterType
): LicenseStatusClient => {
  const search = (name: string, zipCode: string): Promise<LicenseEntity[]> => {
    const url = `${baseUrl}/ws/simple/queryLicenseStatuses`;
    const logId = logWriter.GetId();
    logWriter.LogInfo(
      `Webservice License Status Client - Request Sent.- Id: ${logId}  url: ${url}. Business Name: ${name}. ZipCode: ${zipCode}`
    );
    return axios
      .post(url, {
        zipCode: zipCode,
        businessName: name,
      })
      .then((response) => {
        logWriter.LogInfo(
          `Webservice License Status Client - Response Received.- Id: ${logId}  Status: ${
            response.status
          } StatusText: ${response.statusText}. Data: ${JSON.stringify(response.data)}`
        );
        return response.data || [];
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Webservice License Status Client - Error. - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  const health: HealthCheckMethod = () => {
    const url = `${baseUrl}/ws/simple/queryLicenseStatuses`;
    const logId = logWriter.GetId();
    const name = "Innovation Test Business";
    const zipCode = 12345;

    return axios
      .post(url, {
        zipCode: zipCode,
        businessName: name,
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
        logWriter.LogError(
          `Webservice License Status Client - Heath Check Error. - Id:${logId} - Error:`,
          error
        );
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

  return {
    search,
    health,
  };
};

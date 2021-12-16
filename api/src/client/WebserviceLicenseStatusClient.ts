import { LicenseEntity } from "@shared/license";
import axios, { AxiosError } from "axios";
import { LicenseStatusClient } from "../domain/types";
import { LogWriterType } from "../libs/logWriter";

export const WebserviceLicenseStatusClient = (
  baseUrl: string,
  logWriter: LogWriterType
): LicenseStatusClient => {
  const search = (name: string, zipCode: string, licenseType: string): Promise<LicenseEntity[]> => {
    const url = `${baseUrl}/ws/simple/queryLicenseStatus`;
    logWriter.LogInfo(
      `License Status Search - Request Sent. url: ${url}. Business Name: ${name}. License Type: ${licenseType}. ZipCode: ${zipCode}`
    );
    return axios
      .post(url, {
        zipCode: zipCode,
        businessName: name,
        licenseType: licenseType,
      })
      .then((response) => {
        logWriter.LogInfo(
          `License Status Search - Response Received. Status: ${response.status} : ${response.statusText}. Data: ${response.data}`
        );
        return response.data || [];
      })
      .catch((error: AxiosError) => {
        logWriter.LogError("License Status Search - Error", error);
        return Promise.reject(error.response?.status);
      });
  };

  return {
    search,
  };
};

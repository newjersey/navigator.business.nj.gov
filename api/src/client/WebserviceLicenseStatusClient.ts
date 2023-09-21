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
    const logId = logWriter.GetId();
    logWriter.LogInfo(
      `License Status Search - Request Sent.- Id:${logId}  url: ${url}. Business Name: ${name}. License Type: ${licenseType}. ZipCode: ${zipCode}`
    );
    return axios
      .post(url, {
        zipCode: zipCode,
        businessName: name,
        licenseType: licenseType,
      })
      .then((response) => {
        logWriter.LogInfo(
          `License Status Search - Response Received.- Id:${logId}  Status: ${response.status} : ${
            response.statusText
          }. Data: ${JSON.stringify(response.data)}`
        );
        return response.data || [];
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`License Status Search - Id:${logId} - Error:`, error);
        console.log(error.response?.status);
        throw error.response?.status;
      });
  };

  // const determineLicenseStatus = (licenseStatus: string): LicenseStatus => {
  //   switch (licenseStatus) {
  //     case "Active":
  //       return "ACTIVE";
  //     case "Pending":
  //       return "PENDING";
  //     case "Expired":
  //       return "EXPIRED";
  //     case "Barred":
  //       return "BARRED";
  //     case "Out of Business":
  //       return "OUT_OF_BUSINESS";
  //     case "Reinstatement Pending":
  //       return "REINSTATEMENT_PENDING";
  //     case "Closed":
  //       return "CLOSED";
  //     case "Deleted":
  //       return "DELETED";
  //     case "Denied":
  //       return "DENIED";
  //     case "Voluntary Surrender":
  //       return "VOLUNTARY_SURRENDER";
  //     case "Withdrawn":
  //       return "WITHDRAWN";
  //     default:
  //       return "UNKNOWN";
  //   }
  // };

  return {
    search,
  };
};

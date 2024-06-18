import { NO_MAIN_APPS_ERROR } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { LicenseStatus } from "@shared/license";
import axios, { AxiosError } from "axios";
import {
  ACTIVE_STATECODE,
  LicenseApplicationIdClient,
  LicenseApplicationIdResponse,
  MAIN_APP_END_DIGITS,
} from "./types";

export const DynamicsLicenseApplicationIdClient = (
  logWriter: LogWriterType,
  orgUrl: string
): LicenseApplicationIdClient => {
  const getLicenseApplicationId = (
    accessToken: string,
    businessId: string,
    licenseType: string
  ): Promise<LicenseApplicationIdResponse> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics License Application Id Client - Id:${logId}`);

    return axios
      .get(
        `${orgUrl}/api/data/v9.2/rgb_applications?$select=rgb_appnumber,rgb_number,rgb_startdate,rgb_versioncode,rgb_expirationdate,statecode,statuscode,rgb_applicationid&$filter=(_rgb_businessid_value eq ${businessId} and _rgb_apptypeid_value eq ${licenseTypeToLicenseId[licenseType]})&$top=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        logWriter.LogInfo(
          `Dynamics License Application Id Client - Id:${logId} - Response: ${JSON.stringify(response.data)}`
        );

        const mainActiveApplications = response.data.value
          .filter(
            (applicationDetails: LicenseApplicationIdApiResponse) =>
              applicationDetails.statecode === ACTIVE_STATECODE
          )
          .filter(
            (applicationDetails: LicenseApplicationIdApiResponse) =>
              applicationDetails.rgb_number && applicationDetails.rgb_number.slice(-2) === MAIN_APP_END_DIGITS
          );

        if (mainActiveApplications.length === 0) {
          throw new Error(NO_MAIN_APPS_ERROR);
        }

        return processApplicationDetails(mainActiveApplications[0]);
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics License Application Id Client - Id:${logId} - Error:`, error);
        if (error.message === NO_MAIN_APPS_ERROR) throw error;
        throw error.response?.status;
      });
  };

  return {
    getLicenseApplicationId,
  };
};

const licenseTypeToLicenseId: Record<string, string> = {
  "Public Movers and Warehousemen": "19391a3f-53df-eb11-bacb-001dd8028561",
  "Home Improvement Contractor": "7a391a3f-53df-eb11-bacb-001dd8028561",
  "Health Care Services": "3ac8456a-53df-eb11-bacb-001dd8028561",
  "Health Club Services": "af8e3564-53df-eb11-bacb-001dd8028561",
};

const statusCodeToLicenseStatus: Record<number, LicenseStatus> = {
  1: "DRAFT",
  100000000: "SUBMITTED",
  100000001: "UNDER_INTERNAL_REVIEW",
  100000017: "SPECIAL_REVIEW",
  100000002: "PENDING_DEFICIENCIES",
  100000003: "DEFICIENCIES_SUBMITTED",
  100000004: "CHECKLIST_COMPLETED",
  100000005: "APPROVED",
  100000006: "ACTIVE",
  100000007: "PENDING_RENEWAL",
  100000008: "PENDING_REINSTATEMENT",
  100000018: "EXPIRED",
  2: "INACTIVE",
  100000009: "WITHDRAWN",
  100000010: "ABANDONED",
  100000011: "DENIED",
  100000012: "EXPIRED",
  100000013: "SUSPENDED",
  100000014: "REVOKED",
  100000015: "CLOSED",
  100000016: "BARRED",
};

type LicenseApplicationIdApiResponse = {
  rgb_appnumber: string;
  rgb_number: string;
  rgb_startdate: string;
  rgb_versioncode: number;
  rgb_expirationdate: string;
  statecode: number;
  statuscode: number;
  rgb_applicationid: string;
};

const processApplicationDetails = (
  response: LicenseApplicationIdApiResponse
): LicenseApplicationIdResponse => {
  return {
    expirationDate: response.rgb_expirationdate || "",
    applicationId: response.rgb_applicationid || "",
    licenseStatus: statusCodeToLicenseStatus[response.statuscode] || "",
  };
};

import {
  ACTIVE_STATECODE,
  BusinessIdAndName,
  LicenseApplicationIdResponse,
  LicenseApplicationIdsForAllBusinessIdsClient,
  MAIN_APP_END_DIGITS,
} from "@client/dynamics/license-status/rgbDynamicsLicenseStatusTypes";
import { NO_MATCH_ERROR } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { LicenseStatus } from "@shared/license";
import axios, { AxiosError } from "axios";

export const RgbDynamicsLicenseApplicationIdsClient = (
  logWriter: LogWriterType,
  orgUrl: string
): LicenseApplicationIdsForAllBusinessIdsClient => {
  const getLicenseApplicationIdsForAllBusinessIds = async (
    accessToken: string,
    businessIdAndName: BusinessIdAndName[]
  ): Promise<LicenseApplicationIdResponse[]> => {
    const getLicenseApplicationIds = (
      businessIdAndName: BusinessIdAndName
    ): Promise<LicenseApplicationIdResponse[]> => {
      const logId = logWriter.GetId();
      logWriter.LogInfo(`RGB Dynamics License Application Ids Client - Id:${logId}`);

      return axios
        .get(
          `${orgUrl}/api/data/v9.2/rgb_applications?$select=${appTypeKeysString},_rgb_apptypeid_value,rgb_name,rgb_appnumber,rgb_number,rgb_startdate,rgb_versioncode,rgb_expirationdate,statecode,statuscode,rgb_applicationid&$filter=(_rgb_businessid_value eq ${businessIdAndName.businessId})`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then((response) => {
          logWriter.LogInfo(
            `RGB Dynamics License Application Id Client - Id:${logId} - Response: ${JSON.stringify(
              response.data
            )}`
          );
          const activeApplications = response.data.value
            .filter(
              (applicationDetails: LicenseApplicationIdApiResponse) =>
                applicationDetails.statecode === ACTIVE_STATECODE
            )
            .filter((applicationDetails: LicenseApplicationIdApiResponse) => {
              if (applicationDetails._rgb_apptypeid_value === PUBLIC_MOVERS_LICENSE_UUID) {
                return (
                  applicationDetails.rgb_number &&
                  applicationDetails.rgb_number.slice(-2) === MAIN_APP_END_DIGITS
                );
              }
              return applicationDetails.rgb_number !== null;
            });

          if (activeApplications.length === 0) {
            throw new Error(NO_MATCH_ERROR);
          }

          return processApplicationDetails(activeApplications);
        })
        .catch((error: AxiosError) => {
          logWriter.LogError(`RGB Dynamics License Application Id Client - Id:${logId} - Error:`, error);
          if (error.message === NO_MATCH_ERROR) throw error;
          throw error.response?.status;
        });
    };

    const LicenseApplicationIdResponses = await Promise.all(
      businessIdAndName.map((businessIdAndName: BusinessIdAndName) =>
        getLicenseApplicationIds(businessIdAndName)
      )
    );

    return LicenseApplicationIdResponses.flat();
  };

  return {
    getLicenseApplicationIdsForAllBusinessIds,
  };
};

const statusCodeToLicenseStatus: Record<number, LicenseStatus> = {
  1: "DRAFT",
  100000000: "SUBMITTED",
  100000001: "UNDER_INTERNAL_REVIEW",
  100000002: "PENDING_DEFICIENCIES",
  100000003: "DEFICIENCIES_SUBMITTED",
  100000004: "CHECKLIST_COMPLETED",
  100000005: "APPROVED",
  100000006: "ACTIVE",
  100000007: "PENDING_RENEWAL",
  100000008: "PENDING_REINSTATEMENT",
  100000009: "WITHDRAWN",
  100000010: "ABANDONED",
  100000011: "DENIED",
  100000012: "EXPIRED",
  100000013: "SUSPENDED",
  100000014: "REVOKED",
  100000015: "CLOSED",
  100000016: "BARRED",
  100000017: "SPECIAL_REVIEW",
  100000018: "EXPIRED",
  2: "INACTIVE",
};

const BILL_LICENSE_UUID = "07d21d75-8a26-ec11-b6e6-001dd804b17d";
const CAREER_CONSULTING_LICENSE_UUID = "8d648d56-5f41-ec11-8c62-001dd805064d";
const CONSULTING_FIRM_LICENSE_UUID = "ab1479ff-045c-ec11-8f8e-001dd80506d4";
const EPS_LICENSE_UUID = "94b36669-e15b-ec11-8f8e-001dd8050971";
const HEALTH_CARE_LICENSE_UUID = "3ac8456a-53df-eb11-bacb-001dd8028561";
const HEALTH_CLUB_LICENSE_UUID = "af8e3564-53df-eb11-bacb-001dd8028561";
const HOME_ELEVATION_LICENSE_UUID = "bc492345-53df-eb11-bacb-001dd8028561";
const HOME_IMPROVEMENT_LICENSE_UUID = "7a391a3f-53df-eb11-bacb-001dd8028561";
const LABOR_MATCHING_LICENSE_UUID = "b7f1016b-0b25-ec11-b6e6-001dd804a0a4";
const PUBLIC_MOVERS_LICENSE_UUID = "19391a3f-53df-eb11-bacb-001dd8028561";
const TELEMARKETERS_LICENSE_UUID = "7e957057-53df-eb11-bacb-001dd8028561";
const TICKET_BROKERS_LICENSE_UUID = "538e3564-53df-eb11-bacb-001dd8028561";
const VEHICLE_PROTECTION_LICENSE_UUID = "f6a4335e-53df-eb11-bacb-001dd8028561";

/*
Some of the license types in the RGB API can have sub-types. These are denoted in the application object with the
inclusion of an application type code.

EX: The Employment and Personnel Services application sub type is denoted in rgb_epsapptypecode
where the value 100000000 indicates that this is an application for an Employment Agency.

Not all of the license applications will have a sub type.

EX: Health Club Services does not have a sub type and therefore we are only concerned with the _rgb_apptypeid_value
*/

export const licenseAppType: Record<string, string> = {
  [BILL_LICENSE_UUID]: "Bill",
  [`${CAREER_CONSULTING_LICENSE_UUID}-100000000`]:
    "Career Consulting/Outplacement-Career Consulting/Outplacement",
  [`${CAREER_CONSULTING_LICENSE_UUID}-100000001`]:
    "Career Consulting/Outplacement-Prepaid Computer Job Matching Service",
  [`${CAREER_CONSULTING_LICENSE_UUID}-100000002`]: "Career Consulting/Outplacement-Job Listing Service",
  [`${CONSULTING_FIRM_LICENSE_UUID}-100000000`]: "Consulting Firms/Temporary Help Services-Consulting Firm",
  [`${CONSULTING_FIRM_LICENSE_UUID}-100000001`]:
    "Consulting Firms/Temporary Help Services-Consulting Firm/Temporary Help Service",
  [`${CONSULTING_FIRM_LICENSE_UUID}-100000002`]:
    "Consulting Firms/Temporary Help Services-Temporary Help Service",
  [`${EPS_LICENSE_UUID}-100000000`]: "Employment & Personnel Service-Employment Agency",
  [`${EPS_LICENSE_UUID}-100000001`]: "Employment & Personnel Service-Entertainment/Booking Agency",
  [`${EPS_LICENSE_UUID}-100000002`]: "Employment & Personnel Service-Nurses Registry",
  [`${EPS_LICENSE_UUID}-100000003`]: "Employment & Personnel Service-Career Counseling Service",
  [`${EPS_LICENSE_UUID}-100000004`]: "Employment & Personnel Service-Resume Service",
  [HEALTH_CARE_LICENSE_UUID]: "Health Care Services",
  [HEALTH_CLUB_LICENSE_UUID]: "Health Club Services",
  [HOME_ELEVATION_LICENSE_UUID]: "Home Elevation Contractor",
  [HOME_IMPROVEMENT_LICENSE_UUID]: "Home Improvement Contractor",
  [LABOR_MATCHING_LICENSE_UUID]: "International Labor Matching/Matchmaking Organization",
  [`${PUBLIC_MOVERS_LICENSE_UUID}-100000000`]: "Public Movers and Warehousemen-Moving Only",
  [`${PUBLIC_MOVERS_LICENSE_UUID}-100000001`]: "Public Movers and Warehousemen-Warehousing Only",
  [`${PUBLIC_MOVERS_LICENSE_UUID}-100000002`]: "Public Movers and Warehousemen-Moving and Warehouse",
  [TELEMARKETERS_LICENSE_UUID]: "Telemarketers",
  [TICKET_BROKERS_LICENSE_UUID]: "Ticket Brokers",
  [VEHICLE_PROTECTION_LICENSE_UUID]: "Vehicle Protection Product Warrantor",
};

const appTypeKeys: Record<string, string> = {
  [CAREER_CONSULTING_LICENSE_UUID]: "rgb_careerconsultingapptypecode",
  [CONSULTING_FIRM_LICENSE_UUID]: "rgb_cfthsapptypecode",
  [EPS_LICENSE_UUID]: "rgb_epsapptypecode",
  [PUBLIC_MOVERS_LICENSE_UUID]: "rgb_publicmoverscode",
};

export const appTypeKeysString = Object.values(appTypeKeys).join(",");

export type LicenseApplicationIdApiResponse = {
  rgb_name: string;
  rgb_appnumber: string;
  rgb_number: string | null;
  rgb_startdate: string | null;
  rgb_versioncode: number;
  rgb_expirationdate: string | null;
  statecode: number;
  statuscode: number;
  rgb_applicationid: string;
  _rgb_apptypeid_value: string;
  rgb_epsapptypecode: number | null;
  rgb_publicmoverscode: number | null;
};

const processApplicationDetails = (
  responses: LicenseApplicationIdApiResponse[]
): LicenseApplicationIdResponse[] => {
  return responses.map((response) => {
    const appTypeKey = appTypeKeys[response._rgb_apptypeid_value] as keyof typeof response;
    const isAppTypeKeyValid = !!appTypeKey && response[appTypeKey] !== null;
    const professionNameAndLicenseType = isAppTypeKeyValid
      ? licenseAppType[`${response._rgb_apptypeid_value}-${response[appTypeKey]}`]
      : licenseAppType[`${response._rgb_apptypeid_value}`];

    return {
      expirationDateISO: response.rgb_expirationdate || "",
      applicationId: response.rgb_applicationid || "",
      licenseStatus: statusCodeToLicenseStatus[response.statuscode] || "",
      professionNameAndLicenseType,
    };
  });
};

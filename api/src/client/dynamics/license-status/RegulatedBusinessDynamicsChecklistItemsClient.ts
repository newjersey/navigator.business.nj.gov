import { LicenseChecklistResponse } from "@api/types";
import {
  ChecklistItemsForAllApplicationsClient,
  LicenseApplicationIdResponse,
} from "@client/dynamics/license-status/regulatedBusinessDynamicsLicenseStatusTypes";
import { LogWriterType } from "@libs/logWriter";
import { CheckoffStatus, LicenseStatusItem } from "@shared/license";
import axios, { AxiosError } from "axios";

export const RegulatedBusinessDynamicsChecklistItemsClient = (
  logWriter: LogWriterType,
  orgUrl: string
): ChecklistItemsForAllApplicationsClient => {
  const getChecklistItems = async (
    accessToken: string,
    licenseApplicationInformation: LicenseApplicationIdResponse
  ): Promise<LicenseChecklistResponse> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Rgb Checklist Items Client - Id:${logId}`);
    return axios
      .get(
        `${orgUrl}/api/data/v9.2/rgb_checklistitems?$select=activitytypecode,rgb_categorycode,statecode,subject,statuscode&$filter=(_regardingobjectid_value eq ${licenseApplicationInformation.applicationId})`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        logWriter.LogInfo(
          `RGB Dynamics Checklist Items Client - Id:${logId} - Response: ${JSON.stringify(response.data)}`
        );

        const checklistItems = response.data.value.map((checklistItem: DynamicsApiChecklistItemsResponse) =>
          processChecklistItems(checklistItem)
        );
        return {
          licenseStatus: licenseApplicationInformation.licenseStatus,
          professionNameAndLicenseType: licenseApplicationInformation.professionNameAndLicenseType,
          expirationDateISO: licenseApplicationInformation.expirationDateISO,
          checklistItems,
        };
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`RGB Dynamics Checklist Items Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  const getChecklistItemsForAllApplications = async (
    accessToken: string,
    applicationIdResponse: LicenseApplicationIdResponse[]
  ): Promise<LicenseChecklistResponse[]> => {
    return await Promise.all(
      applicationIdResponse.map((licenseApplicationInformation) =>
        getChecklistItems(accessToken, licenseApplicationInformation)
      )
    );
  };

  return {
    getChecklistItemsForAllApplications,
  };
};

type DynamicsApiChecklistItemsResponse = {
  activitytypecode: string;
  rgb_categorycode: number;
  statecode: number;
  subject: string;
  statuscode: number;
  activityid: string;
};

const statusCodeToChecklistItemStatus: Record<number, CheckoffStatus> = {
  1: "PENDING",
  2: "ACTIVE",
  3: "PENDING",
  4: "PENDING",
};

const processChecklistItems = (checklistItem: DynamicsApiChecklistItemsResponse): LicenseStatusItem => {
  return {
    title: checklistItem.subject,
    status: statusCodeToChecklistItemStatus[checklistItem.statuscode],
  };
};

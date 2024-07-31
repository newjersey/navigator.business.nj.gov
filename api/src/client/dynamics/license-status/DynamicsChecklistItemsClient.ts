import { ChecklistItemsClient } from "@client/dynamics/license-status/types";
import { LogWriterType } from "@libs/logWriter";
import { CheckoffStatus, LicenseStatusItem } from "@shared/license";
import axios, { AxiosError } from "axios";

export const DynamicsChecklistItemsClient = (
  logWriter: LogWriterType,
  orgUrl: string
): ChecklistItemsClient => {
  const getChecklistItems = async (
    accessToken: string,
    licenseApplicationId: string
  ): Promise<LicenseStatusItem[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Checklist Items Client - Id:${logId}`);
    return axios
      .get(
        `${orgUrl}/api/data/v9.2/rgb_checklistitems?$select=activitytypecode,rgb_categorycode,statecode,subject,statuscode&$filter=(_regardingobjectid_value eq ${licenseApplicationId})&$top=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        logWriter.LogInfo(
          `Dynamics Checklist Items Client - Id:${logId} - Response: ${JSON.stringify(response.data)}`
        );

        return response.data.value.map((checklistItem: DynamicsApiChecklistItemsResponse) =>
          processChecklistItems(checklistItem)
        );
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Checklist Items Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getChecklistItems,
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

import { searchBusinessAddressesForMatch } from "@client/dynamics/license-status/searchBusinessAddressesForMatch";
import {
  BusinessAddressClient,
  BusinessIdClient,
  ChecklistItemsClient,
  LicenseApplicationIdClient,
} from "@client/dynamics/license-status/types";
import { AccessTokenClient } from "@client/dynamics/types";
import { SearchLicenseStatus } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { LicenseSearchNameAndAddress, LicenseStatusResult } from "@shared/license";

type Config = {
  accessTokenClient: AccessTokenClient;
  businessIdClient: BusinessIdClient;
  businessAddressClient: BusinessAddressClient;
  licenseApplicationIdClient: LicenseApplicationIdClient;
  checklistItemsClient: ChecklistItemsClient;
};

export const DynamicsLicenseStatusClient = (
  logWriter: LogWriterType,
  config: Config
): SearchLicenseStatus => {
  return async (
    nameAndAddress: LicenseSearchNameAndAddress,
    licenseType: string
  ): Promise<LicenseStatusResult> => {
    const accessToken = await config.accessTokenClient.getAccessToken();

    const matchedBusinessIds = await config.businessIdClient.getMatchedBusinessIds(
      accessToken,
      nameAndAddress.name
    );

    const businessIdsAndLicenseSearchAddresses =
      await config.businessAddressClient.getBusinessIdsAndLicenseSearchAddresses(
        accessToken,
        matchedBusinessIds
      );

    const matchedBusinessIdByAddress = searchBusinessAddressesForMatch(
      businessIdsAndLicenseSearchAddresses,
      nameAndAddress
    );

    const applicationIdResponse = await config.licenseApplicationIdClient.getLicenseApplicationId(
      accessToken,
      matchedBusinessIdByAddress,
      licenseType
    );

    const checkListItems = await config.checklistItemsClient.getChecklistItems(
      accessToken,
      applicationIdResponse.applicationId
    );

    const response = {
      status: applicationIdResponse.licenseStatus,
      expirationISO: applicationIdResponse.expirationDate,
      checklistItems: checkListItems,
    };

    const logId = logWriter.GetId();
    logWriter.LogInfo(
      `Dynamics License Status Client - Id:${logId} - Response:  ${JSON.stringify(response)}`
    );

    return response;
  };
};

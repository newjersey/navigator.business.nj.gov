import { LicenseStatusResults } from "@api/types";
import { formatRgbApplications } from "@client/dynamics/license-status/formatRgbApplications";
import {
  BusinessAddressesClient,
  BusinessIdsAndNamesClient,
  ChecklistItemsForAllApplicationsClient,
  LicenseApplicationIdsForAllBusinessIdsClient,
} from "@client/dynamics/license-status/rgbLicenseStatusTypes";
import { searchBusinessAddressesForMatches } from "@client/dynamics/license-status/searchBusinessAddressesForMatches";
import { AccessTokenClient } from "@client/dynamics/types";
import { SearchLicenseStatus } from "@domain/types";
import { LicenseSearchNameAndAddress } from "@shared/license";

interface Config {
  dynamicsAccessTokenClient: AccessTokenClient;
  rgbBusinessIdsAndNamesClient: BusinessIdsAndNamesClient;
  rgbBusinessAddressesClient: BusinessAddressesClient;
  rgbLicenseApplicationIdsClient: LicenseApplicationIdsForAllBusinessIdsClient;
  rgbChecklistItemsClient: ChecklistItemsForAllApplicationsClient;
}

export const RgbLicenseStatusClient = (config: Config): SearchLicenseStatus => {
  return async (nameAndAddress: LicenseSearchNameAndAddress): Promise<LicenseStatusResults> => {
    const accessToken = await config.dynamicsAccessTokenClient.getAccessToken();

    const matchedBusinessIdsAndNames =
      await config.rgbBusinessIdsAndNamesClient.getMatchedBusinessIdsAndNames(
        accessToken,
        nameAndAddress.name
      );

    const businessAddressesForAllBusinessIds =
      await config.rgbBusinessAddressesClient.getBusinessAddressesForAllBusinessIds(
        accessToken,
        matchedBusinessIdsAndNames
      );

    const matchedBusinessIdAndNameByAddress = searchBusinessAddressesForMatches(
      businessAddressesForAllBusinessIds,
      nameAndAddress
    );

    const applicationIdsForAllBusinessIdsResponse =
      await config.rgbLicenseApplicationIdsClient.getLicenseApplicationIdsForAllBusinessIds(
        accessToken,
        matchedBusinessIdAndNameByAddress
      );

    const applicationsWithChecklistItems =
      await config.rgbChecklistItemsClient.getChecklistItemsForAllApplications(
        accessToken,
        applicationIdsForAllBusinessIdsResponse
      );
    return formatRgbApplications(applicationsWithChecklistItems);
  };
};

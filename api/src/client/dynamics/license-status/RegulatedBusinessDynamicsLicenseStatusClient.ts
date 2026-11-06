import { formatRegulatedBusinessDynamicsApplications } from "@client/dynamics/license-status/formatRegulatedBusinessDynamicsApplications";
import type {
  BusinessAddressesClient,
  BusinessIdsAndNamesClient,
  ChecklistItemsForAllApplicationsClient,
  LicenseApplicationIdsForAllBusinessIdsClient,
} from "@client/dynamics/license-status/regulatedBusinessDynamicsLicenseStatusTypes";
import { searchBusinessAddressesForMatches } from "@client/dynamics/license-status/searchBusinessAddressesForMatches";
import type { AccessTokenClient } from "@client/dynamics/types";
import type { SearchLicenseStatus } from "@domain/types";
import type { LicenseStatusResults } from "@shared/domain-logic/licenseStatusHelpers";
import type { LicenseSearchNameAndAddress } from "@shared/license";

interface RgbApiConfiguration {
  dynamicsAccessTokenClient: AccessTokenClient;
  rgbBusinessIdsAndNamesClient: BusinessIdsAndNamesClient;
  rgbBusinessAddressesClient: BusinessAddressesClient;
  rgbLicenseApplicationIdsClient: LicenseApplicationIdsForAllBusinessIdsClient;
  rgbChecklistItemsClient: ChecklistItemsForAllApplicationsClient;
}

export const RegulatedBusinessDynamicsLicenseStatusClient = (
  rgbApiConfiguration: RgbApiConfiguration,
): SearchLicenseStatus => {
  return async function RgbDynamicsLicenseStatusClientFunction(
    nameAndAddress: LicenseSearchNameAndAddress,
  ): Promise<LicenseStatusResults> {
    const accessToken = await rgbApiConfiguration.dynamicsAccessTokenClient.getAccessToken();

    const matchedBusinessIdsAndNames =
      await rgbApiConfiguration.rgbBusinessIdsAndNamesClient.getMatchedBusinessIdsAndNames(
        accessToken,
        nameAndAddress.name,
      );

    const businessAddressesForAllBusinessIds =
      await rgbApiConfiguration.rgbBusinessAddressesClient.getBusinessAddressesForAllBusinessIds(
        accessToken,
        matchedBusinessIdsAndNames,
      );

    const matchedBusinessIdAndNameByAddress = searchBusinessAddressesForMatches(
      businessAddressesForAllBusinessIds,
      nameAndAddress,
    );

    const applicationIdsForAllBusinessIdsResponse =
      await rgbApiConfiguration.rgbLicenseApplicationIdsClient.getLicenseApplicationIdsForAllBusinessIds(
        accessToken,
        matchedBusinessIdAndNameByAddress,
      );

    const applicationsWithChecklistItems =
      await rgbApiConfiguration.rgbChecklistItemsClient.getChecklistItemsForAllApplications(
        accessToken,
        applicationIdsForAllBusinessIdsResponse,
      );

    return formatRegulatedBusinessDynamicsApplications(applicationsWithChecklistItems);
  };
};

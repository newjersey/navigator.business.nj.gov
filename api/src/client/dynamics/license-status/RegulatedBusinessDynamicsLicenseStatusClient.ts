import { LicenseStatusResults } from "@api/types";
import { formatRegulatedBusinessDynamicsApplications } from "@client/dynamics/license-status/formatRegulatedBusinessDynamicsApplications";
import {
  BusinessAddressesClient,
  BusinessIdsAndNamesClient,
  ChecklistItemsForAllApplicationsClient,
  LicenseApplicationIdsForAllBusinessIdsClient,
} from "@client/dynamics/license-status/regulatedBusinessDynamicsLicenseStatusTypes";
import { searchBusinessAddressesForMatches } from "@client/dynamics/license-status/searchBusinessAddressesForMatches";
import { AccessTokenClient } from "@client/dynamics/types";
import { SearchLicenseStatus } from "@domain/types";
import { LicenseSearchNameAndAddress } from "@shared/license";

interface RgbApiConfiguration {
  dynamicsAccessTokenClient: AccessTokenClient;
  rgbBusinessIdsAndNamesClient: BusinessIdsAndNamesClient;
  rgbBusinessAddressesClient: BusinessAddressesClient;
  rgbLicenseApplicationIdsClient: LicenseApplicationIdsForAllBusinessIdsClient;
  rgbChecklistItemsClient: ChecklistItemsForAllApplicationsClient;
}

const DEBUG_RegulatedBusinessDynamicsLicenseSearch = false; // this variable exists in updateLicenseStatusFactory; enable both for debugging

export const RegulatedBusinessDynamicsLicenseStatusClient = (
  rgbApiConfiguration: RgbApiConfiguration
): SearchLicenseStatus => {
  return async function RgbDynamicsLicenseStatusClientFunction(
    nameAndAddress: LicenseSearchNameAndAddress
  ): Promise<LicenseStatusResults> {
    const accessToken = await rgbApiConfiguration.dynamicsAccessTokenClient.getAccessToken();

    const matchedBusinessIdsAndNames =
      await rgbApiConfiguration.rgbBusinessIdsAndNamesClient.getMatchedBusinessIdsAndNames(
        accessToken,
        nameAndAddress.name
      );

    if (DEBUG_RegulatedBusinessDynamicsLicenseSearch) {
      console.log({
        functionName: "getMatchedBusinessIdsAndNames",
        results: matchedBusinessIdsAndNames,
      });
    }

    const businessAddressesForAllBusinessIds =
      await rgbApiConfiguration.rgbBusinessAddressesClient.getBusinessAddressesForAllBusinessIds(
        accessToken,
        matchedBusinessIdsAndNames
      );

    if (DEBUG_RegulatedBusinessDynamicsLicenseSearch) {
      console.log({
        functionName: "getBusinessAddressesForAllBusinessIds",
        results: businessAddressesForAllBusinessIds,
      });
    }

    const matchedBusinessIdAndNameByAddress = searchBusinessAddressesForMatches(
      businessAddressesForAllBusinessIds,
      nameAndAddress
    );

    if (DEBUG_RegulatedBusinessDynamicsLicenseSearch) {
      console.log({
        functionName: "searchBusinessAddressesForMatches",
        results: matchedBusinessIdAndNameByAddress,
      });
    }

    const applicationIdsForAllBusinessIdsResponse =
      await rgbApiConfiguration.rgbLicenseApplicationIdsClient.getLicenseApplicationIdsForAllBusinessIds(
        accessToken,
        matchedBusinessIdAndNameByAddress
      );

    if (DEBUG_RegulatedBusinessDynamicsLicenseSearch) {
      console.log({
        functionName: "getLicenseApplicationIdsForAllBusinessIds",
        results: applicationIdsForAllBusinessIdsResponse,
      });
    }

    const applicationsWithChecklistItems =
      await rgbApiConfiguration.rgbChecklistItemsClient.getChecklistItemsForAllApplications(
        accessToken,
        applicationIdsForAllBusinessIdsResponse
      );

    const results = formatRegulatedBusinessDynamicsApplications(applicationsWithChecklistItems);

    if (DEBUG_RegulatedBusinessDynamicsLicenseSearch) {
      console.log({
        functionName: "formatRegulatedBusinessDynamicsApplications",
        results: results,
      });
    }
    return results;
  };
};

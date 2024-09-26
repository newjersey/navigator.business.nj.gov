import { LicenseChecklistResponse } from "@api/types";
import { LicenseSearchAddress, LicenseStatus } from "@shared/license";

export interface BusinessIdsAndNamesClient {
  getMatchedBusinessIdsAndNames: (accessToken: string, nameToSearch: string) => Promise<BusinessIdAndName[]>;
}

export interface BusinessAddressesClient {
  getBusinessAddressesForAllBusinessIds: (
    accessToken: string,
    businessIdAndName: BusinessIdAndName[]
  ) => Promise<BusinessIdAndLicenseSearchNameAndAddresses[]>;
}

export interface ChecklistItemsForAllApplicationsClient {
  getChecklistItemsForAllApplications: (
    accessToken: string,
    licenseApplicationInformation: LicenseApplicationIdResponse[]
  ) => Promise<LicenseChecklistResponse[]>;
}

export interface BusinessIdAndLicenseSearchNameAndAddresses extends BusinessIdAndName {
  addresses: LicenseSearchAddress[];
}

export interface LicenseApplicationIdsForAllBusinessIdsClient {
  getLicenseApplicationIdsForAllBusinessIds: (
    accessToken: string,
    businessIdsAndNames: BusinessIdAndName[]
  ) => Promise<LicenseApplicationIdResponse[]>;
}

export type BusinessIdAndName = {
  businessId: string;
  name: string;
};

export type LicenseApplicationIdResponse = {
  professionNameAndLicenseType: string;
  expirationDateISO: string;
  applicationId: string;
  licenseStatus: LicenseStatus;
};

export const ACTIVE_STATECODE = 0;
export const MAIN_APP_END_DIGITS = "00";

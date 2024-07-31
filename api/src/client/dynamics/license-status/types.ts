import { LicenseSearchAddress, LicenseStatus, LicenseStatusItem } from "@shared/license";

export interface BusinessIdClient {
  getMatchedBusinessIds: (accessToken: string, nameToSearch: string) => Promise<string[]>;
}

export interface BusinessAddressClient {
  getBusinessIdsAndLicenseSearchAddresses: (
    accessToken: string,
    businessIds: string[]
  ) => Promise<BusinessIdAndLicenseSearchAddresses[]>;
}

export interface ChecklistItemsClient {
  getChecklistItems: (accessToken: string, applicationId: string) => Promise<LicenseStatusItem[]>;
}

export interface BusinessIdAndLicenseSearchAddresses {
  businessId: string;
  addresses: LicenseSearchAddress[];
}

export interface LicenseApplicationIdClient {
  getLicenseApplicationId: (
    accessToken: string,
    businessId: string,
    licenseType: string
  ) => Promise<LicenseApplicationIdResponse>;
}

export type LicenseApplicationIdResponse = {
  expirationDate: string;
  applicationId: string;
  licenseStatus: LicenseStatus;
};

export const ACTIVE_STATECODE = 0;
export const MAIN_APP_END_DIGITS = "00";

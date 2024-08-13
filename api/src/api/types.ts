import { LicenseName, LicenseStatus, LicenseStatusItem } from "@shared/license";

export interface ExpressRequestBody<T> extends Express.Request {
  body: T;
}

export type LicenseChecklistResponse = {
  licenseStatus: LicenseStatus;
  expirationDateISO: string | undefined;
  checklistItems: LicenseStatusItem[];
  professionNameAndLicenseType: string;
};

export type LicenseStatusResults = Partial<
  Record<LicenseName, Omit<LicenseChecklistResponse, "professionNameAndLicenseType">>
>;

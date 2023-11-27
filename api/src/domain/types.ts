import { NameAvailability, NameAvailabilityResponse } from "@shared/businessNameSearch";
import { BusinessUser, NewsletterResponse, UserTestingResponse } from "@shared/businessUser";
import { FireSafetyInspectionResult } from "@shared/fireSafety";
import { FormationSubmitResponse, GetFilingResponse, InputFile } from "@shared/formationData";
import { LicenseEntity, LicenseSearchNameAndAddress, LicenseStatusResult } from "@shared/license";
import { ProfileData } from "@shared/profileData";
import { TaxFilingCalendarEvent, TaxFilingLookupState, TaxFilingOnboardingState } from "@shared/taxFiling";
import { UserData } from "@shared/userData";
import * as https from "node:https";

export interface UserDataClient {
  get: (userId: string) => Promise<UserData>;
  findByEmail: (email: string) => Promise<UserData | undefined>;
  put: (userData: UserData) => Promise<UserData>;
  getNeedNewsletterUsers: () => Promise<UserData[]>;
  getNeedToAddToUserTestingUsers: () => Promise<UserData[]>;
  getNeedTaxIdEncryptionUsers: () => Promise<UserData[]>;
}

export interface BusinessNameClient {
  search: (name: string) => Promise<NameAvailabilityResponse>;
}

export interface NewsletterClient {
  add: (email: string) => Promise<NewsletterResponse>;
}

export interface FormationClient {
  form: (
    userData: UserData,
    returnUrl: string,
    foreignGoodStandingFile?: InputFile
  ) => Promise<FormationSubmitResponse>;
  getCompletedFiling: (formationId: string) => Promise<GetFilingResponse>;
}

export interface TaxFilingClient {
  lookup: (props: { taxId: string; businessName: string }) => Promise<TaxFilingLookupResponse>;
  onboarding: (props: {
    taxId: string;
    email: string;
    businessName: string;
  }) => Promise<TaxFilingOnboardingResponse>;
}

export interface TaxFilingInterface {
  lookup: (props: { userData: UserData; taxId: string; businessName: string }) => Promise<UserData>;
  onboarding: (props: { userData: UserData; taxId: string; businessName: string }) => Promise<UserData>;
}

export interface EncryptionDecryptionClient {
  encryptValue: (valueToBeEncrypted: string) => Promise<string>;
  decryptValue: (valueToBeDecrypted: string) => Promise<string>;
}

export interface TimeStampBusinessSearch {
  search: (businessName: string) => Promise<NameAvailability>;
}

export type EncryptTaxId = (userData: UserData) => Promise<UserData>;

export type AddNewsletter = (userData: UserData) => Promise<UserData>;
export type AddToUserTesting = (userData: UserData) => Promise<UserData>;

export interface LicenseStatusClient {
  search: (name: string, zipCode: string, licenseType: string) => Promise<LicenseEntity[]>;
}

export interface UserTestingClient {
  add: (user: BusinessUser, profileData: ProfileData) => Promise<UserTestingResponse>;
}

export interface SelfRegClient {
  grant: (user: BusinessUser) => Promise<SelfRegResponse>;
  resume: (authID: string) => Promise<SelfRegResponse>;
}

export type TaxFilingResult = { Content: string; Id: string; Values: string[] };

export type TaxIdentifierToIdsRecord = Record<string, string[]>;

export type TaxFilingOnboardingResponse = {
  state: TaxFilingOnboardingState;
  errorField?: "businessName" | "formFailure";
};
export interface TaxFilingLookupResponse {
  state: TaxFilingLookupState;
  filings: TaxFilingCalendarEvent[];
  taxCity?: string;
  naicsCode?: string;
}
export type SelfRegResponse = {
  authRedirectURL: string;
  myNJUserKey: string;
};

export type SearchBusinessName = (name: string) => Promise<NameAvailability>;

export type SearchLicenseStatusFactory = (licenseType: string) => SearchLicenseStatus;

export type SearchLicenseStatus = (
  nameAndAddress: LicenseSearchNameAndAddress,
  licenseType: string
) => Promise<LicenseStatusResult>;

export type UpdateLicenseStatus = (
  userData: UserData,
  nameAndAddress: LicenseSearchNameAndAddress
) => Promise<UserData>;

export type FireSafetyInspection = (address: string) => Promise<FireSafetyInspectionResult[]>;

export type UpdateOperatingPhase = (userData: UserData) => UserData;
export type UpdateSidebarCards = (userData: UserData) => UserData;
export type GetCertHttpsAgent = () => Promise<https.Agent>;

export const NO_MATCH_ERROR = "NO_MATCH";
export const NO_MAIN_APPS_ERROR = "NO_MAIN_APPS";
export const MULTIPLE_MAIN_APPS_ERROR = "MULTIPLE_MAIN_APPS";

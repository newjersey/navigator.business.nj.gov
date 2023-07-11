import { NameAvailability, NameAvailabilityResponse } from "@shared/businessNameSearch";
import { BusinessUser, NewsletterResponse, UserTestingResponse } from "@shared/businessUser";
import { FormationSubmitResponse, GetFilingResponse, InputFile } from "@shared/formationData";
import { LicenseEntity, LicenseStatusResult, NameAndAddress } from "@shared/license";
import { ProfileData } from "@shared/profileData";
import { TaxFilingCalendarEvent, TaxFilingLookupState, TaxFilingOnboardingState } from "@shared/taxFiling";
import { UserDataPrime } from "@shared/userData";
import * as https from "node:https";

export interface UserDataClient {
  get: (userId: string) => Promise<UserDataPrime>;
  findByEmail: (email: string) => Promise<UserDataPrime | undefined>;
  put: (userData: UserDataPrime) => Promise<UserDataPrime>;
  getNeedNewsletterUsers: () => Promise<UserDataPrime[]>;
  getNeedToAddToUserTestingUsers: () => Promise<UserDataPrime[]>;
  getNeedTaxIdEncryptionUsers: () => Promise<UserDataPrime[]>;
}

export interface BusinessNameClient {
  search: (name: string) => Promise<NameAvailabilityResponse>;
}

export interface NewsletterClient {
  add: (email: string) => Promise<NewsletterResponse>;
}

export interface FormationClient {
  form: (
    userData: UserDataPrime,
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
  lookup: (props: { userData: UserDataPrime; taxId: string; businessName: string }) => Promise<UserDataPrime>;
  onboarding: (props: {
    userData: UserDataPrime;
    taxId: string;
    businessName: string;
  }) => Promise<UserDataPrime>;
}

export interface EncryptionDecryptionClient {
  encryptValue: (valueToBeEncrypted: string) => Promise<string>;
  decryptValue: (valueToBeDecrypted: string) => Promise<string>;
}

export interface TimeStampBusinessSearch {
  search: (businessName: string) => Promise<NameAvailability>;
}

export type EncryptTaxId = (userData: UserDataPrime) => Promise<UserDataPrime>;

export type AddNewsletter = (userData: UserDataPrime) => Promise<UserDataPrime>;
export type AddToUserTesting = (userData: UserDataPrime) => Promise<UserDataPrime>;

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
export type SearchLicenseStatus = (
  nameAndAddress: NameAndAddress,
  licenseType: string
) => Promise<LicenseStatusResult>;
export type UpdateLicenseStatus = (
  userData: UserDataPrime,
  nameAndAddress: NameAndAddress
) => Promise<UserDataPrime>;
export type UpdateOperatingPhase = (userData: UserDataPrime) => UserDataPrime;
export type UpdateSidebarCards = (userData: UserDataPrime) => UserDataPrime;
export type GetCertHttpsAgent = () => Promise<https.Agent>;

import { BusinessUser, NewsletterResponse, UserTestingResponse } from "@shared/businessUser";
import { UserFeedbackRequest, UserIssueRequest } from "@shared/feedbackRequest";
import { FormationSubmitResponse, GetFilingResponse } from "@shared/formationData";
import { LicenseEntity, LicenseStatusResult, NameAndAddress } from "@shared/license";
import { ProfileData } from "@shared/profileData";
import { TaxFiling, TaxFilingState } from "@shared/taxFiling";
import { UserData } from "@shared/userData";
import * as https from "node:https";
export interface UserDataClient {
  get: (userId: string) => Promise<UserData>;
  findByEmail: (email: string) => Promise<UserData | undefined>;
  put: (userData: UserData) => Promise<UserData>;
}

export interface UserDataQlClient {
  search: (statement: string) => Promise<UserData[]>;
  getNeedNewsletterUsers: () => Promise<UserData[]>;
  getNeedToAddToUserTestingUsers: () => Promise<UserData[]>;
}

export interface BusinessNameClient {
  search: (name: string) => Promise<NameAvailability>;
}

export interface NewsletterClient {
  add: (email: string) => Promise<NewsletterResponse>;
}

export interface FormationClient {
  form: (userData: UserData, returnUrl: string) => Promise<FormationSubmitResponse>;
  getCompletedFiling: (formationId: string) => Promise<GetFilingResponse>;
}

export interface TaxFilingClient {
  lookup: (taxId: string, businessName: string) => Promise<TaxFilingLookupResponse>;
  onboarding: (taxId: string, email: string, businessName: string) => Promise<TaxFilingOnboardingResponse>;
}

export interface TaxFilingInterface {
  lookup: (props: { userData: UserData; taxId: string; businessName: string }) => Promise<UserData>;
  onboarding: (props: { userData: UserData; taxId: string; businessName: string }) => Promise<UserData>;
}

export interface EncryptionDecryptionClient {
  encryptValue: (valueToBeEncrypted: string) => Promise<string>;
  decryptValue: (valueToBeDecrypted: string) => Promise<string>;
}

export type AddNewsletter = (userData: UserData) => Promise<UserData>;
export type AddToUserTesting = (userData: UserData) => Promise<UserData>;

export interface LicenseStatusClient {
  search: (name: string, zipCode: string, licenseType: string) => Promise<LicenseEntity[]>;
}

export interface UserTestingClient {
  add: (user: BusinessUser, profileData: ProfileData) => Promise<UserTestingResponse>;
}

export interface FeedbackClient {
  createUserFeedback: (feedbackRequest: UserFeedbackRequest, userData: UserData) => Promise<boolean>;
  createUserIssue: (issueRequest: UserIssueRequest, userData: UserData) => Promise<boolean>;
}

export interface SelfRegClient {
  grant: (user: BusinessUser) => Promise<SelfRegResponse>;
  resume: (authID: string) => Promise<SelfRegResponse>;
}

export type TaxFilingResult = { Content: string; Id: string; Values: string[] };

export type TaxIdentifierToIdsRecord = Record<string, string[]>;

export type TaxFilingOnboardingResponse = {
  state: TaxFilingState;
  errorField?: "Business Name" | "Taxpayer ID";
};
export interface TaxFilingLookupResponse {
  state: TaxFilingState;
  filings: TaxFiling[];
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
export type UpdateLicenseStatus = (userId: string, nameAndAddress: NameAndAddress) => Promise<UserData>;
export type UpdateOperatingPhase = (userData: UserData) => UserData;
export type UpdateSidebarCards = (userData: UserData) => UserData;
export type GetCertHttpsAgent = () => Promise<https.Agent>;

export type NameAvailability = {
  status: "AVAILABLE" | "DESIGNATOR" | "SPECIAL_CHARACTER" | "UNAVAILABLE";
  similarNames: string[];
};

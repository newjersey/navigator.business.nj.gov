import { BusinessUser, NewsletterResponse, UserTestingResponse } from "@shared/businessUser";
import { FormationSubmitResponse } from "@shared/formationData";
import { LicenseEntity, LicenseStatusResult } from "@shared/license";
import { NameAndAddress } from "@shared/misc";
import { TaxFilingData } from "@shared/taxFiling";
import { UserData } from "@shared/userData";
import * as https from "https";

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
  search: (name: string) => Promise<string[]>;
}

export interface NewsletterClient {
  add: (email: string) => Promise<NewsletterResponse>;
}

export interface FormationClient {
  form: (userData: UserData) => Promise<FormationSubmitResponse>;
}

export type AddNewsletter = (userData: UserData) => Promise<UserData>;
export type AddToUserTesting = (userData: UserData) => Promise<UserData>;

export interface LicenseStatusClient {
  search: (name: string, zipCode: string, licenseType: string) => Promise<LicenseEntity[]>;
}

export interface TaxFilingClient {
  fetchForEntityId: (entityId: string) => Promise<TaxFilingData>;
}

export interface UserTestingClient {
  add: (user: BusinessUser) => Promise<UserTestingResponse>;
}

export interface SelfRegClient {
  grant: (user: BusinessUser) => Promise<SelfRegResponse>;
  resume: (authID: string) => Promise<SelfRegResponse>;
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
export type GetCertHttpsAgent = () => Promise<https.Agent>;

export type NameAvailability = {
  status: "AVAILABLE" | "UNAVAILABLE";
  similarNames: string[];
};

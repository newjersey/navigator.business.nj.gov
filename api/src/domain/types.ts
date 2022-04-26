import { BusinessUser, NewsletterResponse, UserTestingResponse } from "@shared/businessUser";
import { FormationSubmitResponse, GetFilingResponse } from "@shared/formationData";
import { LicenseEntity, LicenseStatusResult } from "@shared/license";
import { NameAndAddress } from "@shared/misc";
import { UserData } from "@shared/userData";
import * as https from "https";

export interface UserDataClient {
  readonly get: (userId: string) => Promise<UserData>;
  readonly findByEmail: (email: string) => Promise<UserData | undefined>;
  readonly put: (userData: UserData) => Promise<UserData>;
}

export interface UserDataQlClient {
  readonly search: (statement: string) => Promise<readonly UserData[]>;
  readonly getNeedNewsletterUsers: () => Promise<readonly UserData[]>;
  readonly getNeedToAddToUserTestingUsers: () => Promise<readonly UserData[]>;
}

export interface BusinessNameClient {
  readonly search: (name: string) => Promise<NameAvailability>;
}

export interface NewsletterClient {
  readonly add: (email: string) => Promise<NewsletterResponse>;
}

export interface FormationClient {
  readonly form: (userData: UserData, returnUrl: string) => Promise<FormationSubmitResponse>;
  readonly getCompletedFiling: (formationId: string) => Promise<GetFilingResponse>;
}

export type AddNewsletter = (userData: UserData) => Promise<UserData>;
export type AddToUserTesting = (userData: UserData) => Promise<UserData>;

export interface LicenseStatusClient {
  readonly search: (name: string, zipCode: string, licenseType: string) => Promise<readonly LicenseEntity[]>;
}

export interface UserTestingClient {
  readonly add: (user: BusinessUser) => Promise<UserTestingResponse>;
}

export interface SelfRegClient {
  readonly grant: (user: BusinessUser) => Promise<SelfRegResponse>;
  readonly resume: (authID: string) => Promise<SelfRegResponse>;
}

export type SelfRegResponse = {
  readonly authRedirectURL: string;
  readonly myNJUserKey: string;
};

export type SearchBusinessName = (name: string) => Promise<NameAvailability>;
export type SearchLicenseStatus = (
  nameAndAddress: NameAndAddress,
  licenseType: string
) => Promise<LicenseStatusResult>;
export type UpdateLicenseStatus = (userId: string, nameAndAddress: NameAndAddress) => Promise<UserData>;
export type GetCertHttpsAgent = () => Promise<https.Agent>;

export type NameAvailability = {
  readonly status: "AVAILABLE" | "UNAVAILABLE";
  readonly similarNames: readonly string[];
};

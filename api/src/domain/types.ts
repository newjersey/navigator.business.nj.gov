import { LicenseStatusResults } from "@api/types";
import { NameAvailability, NameAvailabilityResponse } from "@shared/businessNameSearch";
import { BusinessUser, NewsletterResponse, UserTestingResponse } from "@shared/businessUser";
import {
  ElevatorSafetyDeviceInspectionDetails,
  ElevatorSafetyRegistrationSummary,
} from "@shared/elevatorSafety";
import { FireSafetyInspectionResult } from "@shared/fireSafety";
import { FormationSubmitResponse, GetFilingResponse, InputFile } from "@shared/formationData";
import { HousingPropertyInterestDetails, HousingRegistrationRequestLookupResponse } from "@shared/housing";
import {
  LicenseEntity,
  LicenseSearchNameAndAddress,
  LicenseTaskID,
  enabledLicensesSources,
} from "@shared/license";
import { ProfileData } from "@shared/profileData";
import { TaxFilingCalendarEvent, TaxFilingLookupState, TaxFilingOnboardingState } from "@shared/taxFiling";
import { UserData } from "@shared/userData";
import { ReasonPhrases } from "http-status-codes";
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
  health: HealthCheckMethod;
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
  search: (name: string, zipCode: string) => Promise<LicenseEntity[]>;
  health: HealthCheckMethod;
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

export type LicenseType = keyof typeof enabledLicensesSources;

export type SearchLicenseStatusFactory = (licenseType: LicenseType) => SearchLicenseStatus;

export type SearchLicenseStatus = (
  nameAndAddress: LicenseSearchNameAndAddress
) => Promise<LicenseStatusResults>;

export type UpdateLicenseStatus = (
  userData: UserData,
  nameAndAddress: LicenseSearchNameAndAddress,
  taskId?: LicenseTaskID
) => Promise<UserData>;

export type FireSafetyInspectionStatus = (address: string) => Promise<FireSafetyInspectionResult[]>;

export type HousingPropertyInterestStatus = (
  address: string,
  municipalityId: string
) => Promise<HousingPropertyInterestDetails | undefined>;

export type HousingHotelMotelRegistrationStatus = (
  address: string,
  municipalityId: string
) => Promise<HousingRegistrationRequestLookupResponse>;

export type ElevatorSafetyInspectionStatus = (
  address: string
) => Promise<ElevatorSafetyDeviceInspectionDetails[]>;

export type ElevatorSafetyRegistrationStatus = (
  address: string,
  municipalityId: string
) => Promise<ElevatorSafetyRegistrationSummary>;

export type ElevatorSafetyViolationsStatus = (address: string, municipalityId: string) => Promise<boolean>;

export interface SuccessfulHealthCheckMetadata {
  success: true;
  data?: {
    message: HealthCheckMessage;
  };
}

export interface UnsuccessfulHealthCheckMetadata {
  success: false;
  error?: {
    message: HealthCheckMessage;
    timeout?: boolean;
    serverResponseCode?: number;
    serverResponseBody?: string;
  };
}

export type HealthCheckMetadata = SuccessfulHealthCheckMetadata | UnsuccessfulHealthCheckMetadata;

export type SuccessfulHealthCheckResponse = {
  timestamp: number;
} & SuccessfulHealthCheckMetadata;

export type UnsuccessfulHealthCheckResponse = {
  timestamp: number;
} & UnsuccessfulHealthCheckMetadata;

export type HealthCheckResponse = SuccessfulHealthCheckResponse | UnsuccessfulHealthCheckResponse;

export type HealthCheckMethod = () => Promise<HealthCheckMetadata>;
export type HealthCheckMessage = ReasonPhrases;

export type UpdateOperatingPhase = (userData: UserData) => UserData;
export type UpdateSidebarCards = (userData: UserData) => UserData;
export type GetCertHttpsAgent = () => Promise<https.Agent>;

export const NO_MATCH_ERROR = "NO_MATCH";
export const NO_ADDRESS_MATCH_ERROR = "NO_ADDRESS_MATCH";
export const NO_MAIN_APPS_ERROR = "NO_MAIN_APPS";

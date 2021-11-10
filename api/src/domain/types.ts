import * as https from "https";
import { LicenseStatus, LicenseStatusItem, LicenseStatusResult } from "@shared/licenseStatus";
import { Municipality } from "@shared/municipality";
import { TaxFilingData } from "@shared/taxFiling";

export interface UserDataClient {
  get: (userId: string) => Promise<UserData>;
  findByEmail: (email: string) => Promise<UserData | undefined>;
  put: (userData: UserData) => Promise<UserData>;
}

export interface BusinessNameClient {
  search: (name: string) => Promise<string[]>;
}

export interface LicenseStatusClient {
  search: (name: string, zipCode: string, licenseType: string) => Promise<LicenseEntity[]>;
}

export interface TaxFilingClient {
  fetchForEntityId: (entityId: string) => Promise<TaxFilingData>;
}

export type SectionType = "PLAN" | "START" | "OPERATE";

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

export type NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface LicenseData {
  nameAndAddress: NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: LicenseStatus;
  items: LicenseStatusItem[];
}

export type LicenseEntity = {
  fullName: string;
  addressLine1: string;
  addressCity: string;
  addressState: string;
  addressCounty: string;
  addressZipCode: string;
  professionName: string;
  licenseType: string;
  applicationNumber: string;
  licenseNumber: string;
  licenseStatus: string;
  issueDate: string;
  expirationDate: string;
  checklistItem: string;
  checkoffStatus: "Completed" | "Unchecked" | "Not Applicable";
  dateThisStatus: string;
};

export type NameAvailability = {
  status: "AVAILABLE" | "UNAVAILABLE";
  similarNames: string[];
};

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface UserData {
  user: BusinessUser;
  profileData: ProfileData;
  formProgress: FormProgress;
  taskProgress: Record<string, TaskProgress>;
  licenseData: LicenseData | undefined;
  preferences: Preferences;
  taxFilingData: TaxFilingData;
}

export interface Preferences {
  roadmapOpenSections: SectionType[];
  roadmapOpenSteps: number[];
}

export interface ProfileData {
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
}

export type FormProgress = "UNSTARTED" | "COMPLETED";

export type BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
  intercomHash?: string;
};

export const createEmptyUserData = (user: BusinessUser): UserData => {
  return {
    user: user,
    profileData: createEmptyProfileData(),
    formProgress: "UNSTARTED",
    taskProgress: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
    },
    taxFilingData: {
      entityIdStatus: "UNKNOWN",
      filings: [],
    },
  };
};

export const createEmptyProfileData = (): ProfileData => {
  return {
    businessName: "",
    industryId: undefined,
    legalStructureId: undefined,
    municipality: undefined,
    liquorLicense: false,
    homeBasedBusiness: false,
    constructionRenovationPlan: undefined,
    entityId: undefined,
    employerId: undefined,
    taxId: undefined,
    notes: "",
  };
};

import { v28UserData } from "./v28_add_hasExistingBusiness_to_profile";

export interface v29UserData {
  user: v29BusinessUser;
  profileData: v29ProfileData;
  formProgress: v29FormProgress;
  taskProgress: Record<string, v29TaskProgress>;
  licenseData: v29LicenseData | undefined;
  preferences: v29Preferences;
  taxFilingData: v29TaxFilingData;
  version: number;
}

export const migrate_v28_to_v29 = (v28Data: v28UserData): v29UserData => {
  return {
    ...v28Data,
    profileData: {
      ...v28Data.profileData,
      certificationIds: [],
    },
    version: 29,
  };
};

// ---------------- v29 types ----------------

type v29TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v29FormProgress = "UNSTARTED" | "COMPLETED";

type v29BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v29ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v29Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  certificationIds: string[];
}

export type v29Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v29TaxFilingData = {
  entityIdStatus: v29EntityIdStatus;
  filings: v29TaxFiling[];
};

export type v29EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

export type v29TaxFiling = {
  identifier: string;
  dueDate: string;
};
type v29NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v29LicenseData = {
  nameAndAddress: v29NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v29LicenseStatus;
  items: v29LicenseStatusItem[];
};

type v29Preferences = {
  roadmapOpenSections: v29SectionType[];
  roadmapOpenSteps: number[];
};

export type v29LicenseStatusItem = {
  title: string;
  status: v29CheckoffStatus;
};

export type v29CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v29LicenseStatus =
  | "ACTIVE"
  | "PENDING"
  | "UNKNOWN"
  | "EXPIRED"
  | "BARRED"
  | "OUT_OF_BUSINESS"
  | "REINSTATEMENT_PENDING"
  | "CLOSED"
  | "DELETED"
  | "DENIED"
  | "VOLUNTARY_SURRENDER"
  | "WITHDRAWN";

export type v29SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v29 factories ----------------

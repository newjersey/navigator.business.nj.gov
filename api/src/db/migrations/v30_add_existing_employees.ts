import { v29UserData } from "./v29_add_certifications_profile";

export interface v30UserData {
  user: v30BusinessUser;
  profileData: v30ProfileData;
  formProgress: v30FormProgress;
  taskProgress: Record<string, v30TaskProgress>;
  licenseData: v30LicenseData | undefined;
  preferences: v30Preferences;
  taxFilingData: v30TaxFilingData;
  version: number;
}

export const migrate_v29_to_v30 = (v29Data: v29UserData): v30UserData => {
  return {
    ...v29Data,
    profileData: {
      ...v29Data.profileData,
      existingEmployees: undefined,
    },
    version: 30,
  };
};

// ---------------- v30 types ----------------

type v30TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v30FormProgress = "UNSTARTED" | "COMPLETED";

type v30BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v30ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v30Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  certificationIds: string[];
  existingEmployees: string | undefined;
}

export type v30Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v30TaxFilingData = {
  entityIdStatus: v30EntityIdStatus;
  filings: v30TaxFiling[];
};

export type v30EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

export type v30TaxFiling = {
  identifier: string;
  dueDate: string;
};
type v30NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v30LicenseData = {
  nameAndAddress: v30NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v30LicenseStatus;
  items: v30LicenseStatusItem[];
};

type v30Preferences = {
  roadmapOpenSections: v30SectionType[];
  roadmapOpenSteps: number[];
};

export type v30LicenseStatusItem = {
  title: string;
  status: v30CheckoffStatus;
};

export type v30CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v30LicenseStatus =
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

export type v30SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v30 factories ----------------

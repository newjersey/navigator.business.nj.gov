import { v27UserData } from "./v27_add_registration_optouts";

export interface v28UserData {
  user: v28BusinessUser;
  profileData: v28ProfileData;
  formProgress: v28FormProgress;
  taskProgress: Record<string, v28TaskProgress>;
  licenseData: v28LicenseData | undefined;
  preferences: v28Preferences;
  taxFilingData: v28TaxFilingData;
  version: number;
}

export const migrate_v27_to_v28 = (v27Data: v27UserData): v28UserData => {
  return {
    ...v27Data,
    profileData: {
      ...v27Data.profileData,
      hasExistingBusiness: false,
    },
    version: 28,
  };
};

// ---------------- v28 types ----------------

type v28TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v28FormProgress = "UNSTARTED" | "COMPLETED";

type v28BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v28ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v28Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
}

export type v28Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v28TaxFilingData = {
  entityIdStatus: v28EntityIdStatus;
  filings: v28TaxFiling[];
};

export type v28EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

export type v28TaxFiling = {
  identifier: string;
  dueDate: string;
};
type v28NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v28LicenseData = {
  nameAndAddress: v28NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v28LicenseStatus;
  items: v28LicenseStatusItem[];
};

type v28Preferences = {
  roadmapOpenSections: v28SectionType[];
  roadmapOpenSteps: number[];
};

export type v28LicenseStatusItem = {
  title: string;
  status: v28CheckoffStatus;
};

export type v28CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v28LicenseStatus =
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

export type v28SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v28 factories ----------------

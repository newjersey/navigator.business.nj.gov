import { v25UserData } from "./v25_add_intercom_hash_to_user";

export interface v26UserData {
  user: v26BusinessUser;
  profileData: v26ProfileData;
  formProgress: v26FormProgress;
  taskProgress: Record<string, v26TaskProgress>;
  licenseData: v26LicenseData | undefined;
  preferences: v26Preferences;
  taxFilingData: v26TaxFilingData;
  version: number;
}

export const migrate_v25_to_v26 = (v25Data: v25UserData): v26UserData => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dateOfFormation, ...rest } = v25Data.profileData;
  return {
    ...v25Data,
    profileData: rest,
    version: 26,
  };
};

// ---------------- v26 types ----------------

type v26TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v26FormProgress = "UNSTARTED" | "COMPLETED";

type v26BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v26ProfileData {
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v26Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
}

export type v26Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v26TaxFilingData = {
  entityIdStatus: v26EntityIdStatus;
  filings: v26TaxFiling[];
};

export type v26EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

export type v26TaxFiling = {
  identifier: string;
  dueDate: string;
};
type v26NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v26LicenseData = {
  nameAndAddress: v26NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v26LicenseStatus;
  items: v26LicenseStatusItem[];
};

type v26Preferences = {
  roadmapOpenSections: v26SectionType[];
  roadmapOpenSteps: number[];
};

export type v26LicenseStatusItem = {
  title: string;
  status: v26CheckoffStatus;
};

export type v26CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v26LicenseStatus =
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

export type v26SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v26 factories ----------------

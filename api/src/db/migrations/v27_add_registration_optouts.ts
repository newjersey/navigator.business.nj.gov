import { v26UserData } from "./v26_remove_dateofformation";

export interface v27UserData {
  user: v27BusinessUser;
  profileData: v27ProfileData;
  formProgress: v27FormProgress;
  taskProgress: Record<string, v27TaskProgress>;
  licenseData: v27LicenseData | undefined;
  preferences: v27Preferences;
  taxFilingData: v27TaxFilingData;
  version: number;
}

export const migrate_v26_to_v27 = (v26Data: v26UserData): v27UserData => {
  return {
    ...v26Data,
    user: {
      ...v26Data.user,
      receiveNewsletter: false,
      userTesting: false,
    },
    version: 27,
  };
};

// ---------------- v27 types ----------------

type v27TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v27FormProgress = "UNSTARTED" | "COMPLETED";

type v27BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v27ProfileData {
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v27Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
}

export type v27Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v27TaxFilingData = {
  entityIdStatus: v27EntityIdStatus;
  filings: v27TaxFiling[];
};

export type v27EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

export type v27TaxFiling = {
  identifier: string;
  dueDate: string;
};
type v27NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v27LicenseData = {
  nameAndAddress: v27NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v27LicenseStatus;
  items: v27LicenseStatusItem[];
};

type v27Preferences = {
  roadmapOpenSections: v27SectionType[];
  roadmapOpenSteps: number[];
};

export type v27LicenseStatusItem = {
  title: string;
  status: v27CheckoffStatus;
};

export type v27CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v27LicenseStatus =
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

export type v27SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v27 factories ----------------

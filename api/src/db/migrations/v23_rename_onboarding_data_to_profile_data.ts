import { v22UserData } from "./v22_switch_legal_structure_to_id";

export interface v23UserData {
  user: v23BusinessUser;
  profileData: v23ProfileData;
  formProgress: v23FormProgress;
  taskProgress: Record<string, v23TaskProgress>;
  licenseData: v23LicenseData | undefined;
  preferences: v23Preferences;
  taxFilings: v23TaxFiling[];
  version: number;
}

export const migrate_v22_to_v23 = (v22Data: v22UserData): v23UserData => {
  const userData = {
    ...v22Data,
    profileData: {
      ...v22Data.onboardingData,
    },
    version: 23,
  };

  return userData;
};

// ---------------- v23 types ----------------

type v23TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v23FormProgress = "UNSTARTED" | "COMPLETED";

type v23BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v23ProfileData {
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v23Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
}

export type v23Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v23TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v23NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v23LicenseData = {
  nameAndAddress: v23NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v23LicenseStatus;
  items: v23LicenseStatusItem[];
};

type v23Preferences = {
  roadmapOpenSections: v23SectionType[];
  roadmapOpenSteps: number[];
};

export type v23LicenseStatusItem = {
  title: string;
  status: v23CheckoffStatus;
};

export type v23CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v23LicenseStatus =
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

export type v23SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v23 factories ----------------

import { v16UserData } from "./v16_add_user_preferences";

export interface v17UserData {
  user: v17BusinessUser;
  onboardingData: v17OnboardingData;
  formProgress: v17FormProgress;
  taskProgress: Record<string, v17TaskProgress>;
  licenseData: v17LicenseData | undefined;
  preferences: v17Preferences;
  taxFilings: v17TaxFiling[];
  version: number;
}

export const migrate_v16_to_v17 = (v16Data: v16UserData): v17UserData => {
  return {
    ...v16Data,
    onboardingData: {
      ...v16Data.onboardingData,
      dateOfFormation: undefined,
    },
    taxFilings: [],
    version: 17,
  };
};

// ---------------- v17 types ----------------

type v17TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v17FormProgress = "UNSTARTED" | "COMPLETED";

type v17BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v17OnboardingData {
  businessName: string;
  industry: v17Industry | undefined;
  legalStructure: v17LegalStructure | undefined;
  municipality: v17Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
}

export type v17Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v17TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v17Industry =
  | "restaurant"
  | "e-commerce"
  | "home-contractor"
  | "cosmetology"
  | "cleaning-aid"
  | "retail"
  | "generic";

type v17LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation";

type v17NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v17LicenseData = {
  nameAndAddress: v17NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v17LicenseStatus;
  items: v17LicenseStatusItem[];
};

type v17Preferences = {
  roadmapOpenSections: v17SectionType[];
  roadmapOpenSteps: number[];
};

export type v17LicenseStatusItem = {
  title: string;
  status: v17CheckoffStatus;
};

export type v17CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v17LicenseStatus =
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

export type v17SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v17 factories ----------------

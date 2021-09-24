import { v15UserData } from "./v15_add_retail_industry";

export interface v16UserData {
  user: v16BusinessUser;
  onboardingData: v16OnboardingData;
  formProgress: v16FormProgress;
  taskProgress: Record<string, v16TaskProgress>;
  licenseData: v16LicenseData | undefined;
  preferences: v16Preferences;
  version: number;
}

export const migrate_v15_to_v16 = (v15Data: v15UserData): v16UserData => {
  return {
    ...v15Data,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
    },
    version: 16,
  };
};

// ---------------- v16 types ----------------

type v16TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v16FormProgress = "UNSTARTED" | "COMPLETED";

type v16BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v16OnboardingData {
  businessName: string;
  industry: v16Industry | undefined;
  legalStructure: v16LegalStructure | undefined;
  municipality: v16Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
}

export type v16Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v16Industry =
  | "restaurant"
  | "e-commerce"
  | "home-contractor"
  | "cosmetology"
  | "cleaning-aid"
  | "retail"
  | "generic";

type v16LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation";

type v16NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v16LicenseData = {
  nameAndAddress: v16NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v16LicenseStatus;
  items: v16LicenseStatusItem[];
};

type v16Preferences = {
  roadmapOpenSections: v16SectionType[];
  roadmapOpenSteps: number[];
};

export type v16LicenseStatusItem = {
  title: string;
  status: v16CheckoffStatus;
};

export type v16CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v16LicenseStatus =
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

export type v16SectionType = "PLAN" | "START";

// ---------------- v16 factories ----------------

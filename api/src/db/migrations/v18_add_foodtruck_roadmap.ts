import { v17UserData } from "./v17_add_operate_section";

export interface v18UserData {
  user: v18BusinessUser;
  onboardingData: v18OnboardingData;
  formProgress: v18FormProgress;
  taskProgress: Record<string, v18TaskProgress>;
  licenseData: v18LicenseData | undefined;
  preferences: v18Preferences;
  taxFilings: v18TaxFiling[];
  version: number;
}

export const migrate_v17_to_v18 = (v17Data: v17UserData): v18UserData => {
  return {
    ...v17Data,
    version: 18,
  };
};

// ---------------- v18 types ----------------

type v18TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v18FormProgress = "UNSTARTED" | "COMPLETED";

type v18BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v18OnboardingData {
  businessName: string;
  industry: v18Industry | undefined;
  legalStructure: v18LegalStructure | undefined;
  municipality: v18Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
}

export type v18Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v18TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v18Industry =
  | "restaurant"
  | "e-commerce"
  | "home-contractor"
  | "cosmetology"
  | "cleaning-aid"
  | "retail"
  | "food-truck"
  | "generic";

type v18LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation";

type v18NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v18LicenseData = {
  nameAndAddress: v18NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v18LicenseStatus;
  items: v18LicenseStatusItem[];
};

type v18Preferences = {
  roadmapOpenSections: v18SectionType[];
  roadmapOpenSteps: number[];
};

export type v18LicenseStatusItem = {
  title: string;
  status: v18CheckoffStatus;
};

export type v18CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v18LicenseStatus =
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

export type v18SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v18 factories ----------------

import { v18UserData } from "./v18_add_foodtruck_roadmap";

export interface v19UserData {
  user: v19BusinessUser;
  onboardingData: v19OnboardingData;
  formProgress: v19FormProgress;
  taskProgress: Record<string, v19TaskProgress>;
  licenseData: v19LicenseData | undefined;
  preferences: v19Preferences;
  taxFilings: v19TaxFiling[];
  version: number;
}

export const migrate_v18_to_v19 = (v18Data: v18UserData): v19UserData => {
  return {
    ...v18Data,
    version: 19,
  };
};

// ---------------- v19 types ----------------

type v19TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v19FormProgress = "UNSTARTED" | "COMPLETED";

type v19BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v19OnboardingData {
  businessName: string;
  industry: v19Industry | undefined;
  legalStructure: v19LegalStructure | undefined;
  municipality: v19Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
}

export type v19Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v19TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v19Industry =
  | "restaurant"
  | "e-commerce"
  | "home-contractor"
  | "cosmetology"
  | "cleaning-aid"
  | "retail"
  | "food-truck"
  | "employment-agency"
  | "generic";

type v19LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation";

type v19NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v19LicenseData = {
  nameAndAddress: v19NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v19LicenseStatus;
  items: v19LicenseStatusItem[];
};

type v19Preferences = {
  roadmapOpenSections: v19SectionType[];
  roadmapOpenSteps: number[];
};

export type v19LicenseStatusItem = {
  title: string;
  status: v19CheckoffStatus;
};

export type v19CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v19LicenseStatus =
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

export type v19SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v19 factories ----------------

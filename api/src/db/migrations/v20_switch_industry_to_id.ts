import { v19UserData } from "./v19_add_employment_agency_roadmap";

export interface v20UserData {
  user: v20BusinessUser;
  onboardingData: v20OnboardingData;
  formProgress: v20FormProgress;
  taskProgress: Record<string, v20TaskProgress>;
  licenseData: v20LicenseData | undefined;
  preferences: v20Preferences;
  taxFilings: v20TaxFiling[];
  version: number;
}

export const migrate_v19_to_v20 = (v19Data: v19UserData): v20UserData => {
  const updatedOnboardingData = v19Data.onboardingData;
  const industryId = v19Data.onboardingData.industry;
  delete updatedOnboardingData.industry;

  return {
    ...v19Data,
    onboardingData: {
      ...updatedOnboardingData,
      industryId: industryId,
    },
    version: 20,
  };
};

// ---------------- v20 types ----------------

type v20TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v20FormProgress = "UNSTARTED" | "COMPLETED";

type v20BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v20OnboardingData {
  businessName: string;
  industryId: string | undefined;
  legalStructure: v20LegalStructure | undefined;
  municipality: v20Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
}

export type v20Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v20TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v20LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation";

type v20NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v20LicenseData = {
  nameAndAddress: v20NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v20LicenseStatus;
  items: v20LicenseStatusItem[];
};

type v20Preferences = {
  roadmapOpenSections: v20SectionType[];
  roadmapOpenSteps: number[];
};

export type v20LicenseStatusItem = {
  title: string;
  status: v20CheckoffStatus;
};

export type v20CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v20LicenseStatus =
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

export type v20SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v20 factories ----------------

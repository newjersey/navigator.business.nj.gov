import { randomInt } from "@shared/intHelpers";
import { v21UserData } from "./v21_add_tax_fields";

export interface v22UserData {
  user: v22BusinessUser;
  onboardingData: v22OnboardingData;
  formProgress: v22FormProgress;
  taskProgress: Record<string, v22TaskProgress>;
  licenseData: v22LicenseData | undefined;
  preferences: v22Preferences;
  taxFilings: v22TaxFiling[];
  version: number;
}

export const migrate_v21_to_v22 = (v21Data: v21UserData): v22UserData => {
  const updatedOnboardingData = v21Data.onboardingData;
  const legalStructureId = v21Data.onboardingData.legalStructure;
  delete updatedOnboardingData.legalStructure;

  return {
    ...v21Data,
    onboardingData: {
      ...updatedOnboardingData,
      legalStructureId: legalStructureId,
    },
    version: 22,
  };
};

// ---------------- v22 types ----------------

type v22TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v22FormProgress = "UNSTARTED" | "COMPLETED";

type v22BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v22OnboardingData {
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v22Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
}

export type v22Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v22TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v22NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v22LicenseData = {
  nameAndAddress: v22NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v22LicenseStatus;
  items: v22LicenseStatusItem[];
};

type v22Preferences = {
  roadmapOpenSections: v22SectionType[];
  roadmapOpenSteps: number[];
};

export type v22LicenseStatusItem = {
  title: string;
  status: v22CheckoffStatus;
};

export type v22CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v22LicenseStatus =
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

export type v22SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v22 factories ----------------
export const generatev22User = (overrides: Partial<v22BusinessUser>): v22BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev22OnboardingData = (overrides: Partial<v22OnboardingData>): v22OnboardingData => {
  return {
    businessName: `some-business-name-${randomInt()}`,
    industryId: "restaurant",
    legalStructureId: "sole-proprietorship",
    municipality: {
      name: `some-name-${randomInt()}`,
      displayName: `some-display-name-${randomInt()}`,
      county: `some-county-${randomInt()}`,
      id: `some-id-${randomInt()}`,
    },
    liquorLicense: true,
    homeBasedBusiness: true,
    constructionRenovationPlan: undefined,
    dateOfFormation: undefined,
    entityId: undefined,
    employerId: undefined,
    taxId: undefined,
    notes: "",
    ...overrides,
  };
};

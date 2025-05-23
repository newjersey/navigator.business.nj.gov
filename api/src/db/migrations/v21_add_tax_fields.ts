import { type MigrationClients } from "@db/migrations/types";
import { v20UserData } from "@db/migrations/v20_switch_industry_to_id";
import { randomInt } from "@shared/intHelpers";

export interface v21UserData {
  user: v21BusinessUser;
  onboardingData: v21OnboardingData;
  formProgress: v21FormProgress;
  taskProgress: Record<string, v21TaskProgress>;
  licenseData: v21LicenseData | undefined;
  preferences: v21Preferences;
  taxFilings: v21TaxFiling[];
  version: number;
}

export const migrate_v20_to_v21 = (
  v20Data: v20UserData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _?: MigrationClients,
): v21UserData => {
  return {
    ...v20Data,
    onboardingData: {
      ...v20Data.onboardingData,
      entityId: undefined,
      employerId: undefined,
      taxId: undefined,
      notes: "",
    },
    version: 21,
  };
};

// ---------------- v21 types ----------------

type v21TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v21FormProgress = "UNSTARTED" | "COMPLETED";

type v21BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v21OnboardingData {
  businessName: string;
  industryId: string | undefined;
  legalStructure: v21LegalStructure | undefined;
  municipality: v21Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
}

export type v21Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v21TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v21LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation";

type v21NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v21LicenseData = {
  nameAndAddress: v21NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v21LicenseStatus;
  items: v21LicenseStatusItem[];
};

type v21Preferences = {
  roadmapOpenSections: v21SectionType[];
  roadmapOpenSteps: number[];
};

export type v21LicenseStatusItem = {
  title: string;
  status: v21CheckoffStatus;
};

export type v21CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v21LicenseStatus =
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

export type v21SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v21 factories ----------------
export const generatev21User = (overrides: Partial<v21BusinessUser>): v21BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev21OnboardingData = (
  overrides: Partial<v21OnboardingData>,
): v21OnboardingData => {
  return {
    businessName: `some-business-name-${randomInt()}`,
    industryId: "restaurant",
    legalStructure: "sole-proprietorship",
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

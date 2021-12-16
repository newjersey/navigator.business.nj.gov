import dayjs from "dayjs";
import { randomInt } from "./migrations";
import { v23UserData } from "./v23_rename_onboardingData_to_profileData";

export interface v24UserData {
  user: v24BusinessUser;
  profileData: v24ProfileData;
  formProgress: v24FormProgress;
  taskProgress: Record<string, v24TaskProgress>;
  licenseData: v24LicenseData | undefined;
  preferences: v24Preferences;
  taxFilingData: v24TaxFilingData;
  version: number;
}

export const migrate_v23_to_v24 = (v23Data: v23UserData): v24UserData => {
  return {
    ...v23Data,
    taxFilingData: {
      entityIdStatus: "UNKNOWN" as v24EntityIdStatus,
      filings: v23Data.taxFilings,
    },
    version: 24,
  };
};

// ---------------- v24 types ----------------

type v24TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v24FormProgress = "UNSTARTED" | "COMPLETED";

type v24BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v24ProfileData {
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v24Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
}

export type v24Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v24TaxFilingData = {
  entityIdStatus: v24EntityIdStatus;
  filings: v24TaxFiling[];
};

export type v24EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

export type v24TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v24NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v24LicenseData = {
  nameAndAddress: v24NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v24LicenseStatus;
  items: v24LicenseStatusItem[];
};

type v24Preferences = {
  roadmapOpenSections: v24SectionType[];
  roadmapOpenSteps: number[];
};

export type v24LicenseStatusItem = {
  title: string;
  status: v24CheckoffStatus;
};

export type v24CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v24LicenseStatus =
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

export type v24SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v24 factories ----------------

export const generatev24User = (overrides: Partial<v24BusinessUser>): v24BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev24ProfileData = (overrides: Partial<v24ProfileData>): v24ProfileData => {
  return {
    businessName: `some-business-name-${randomInt()}`,
    industryId: `some-industry-${randomInt()}`,
    legalStructureId: `some-legalstructure-${randomInt()}`,
    municipality: {
      name: `some-name-${randomInt()}`,
      displayName: `some-display-name-${randomInt()}`,
      county: `some-county-${randomInt()}`,
      id: `some-id-${randomInt()}`,
    },
    liquorLicense: false,
    homeBasedBusiness: false,
    constructionRenovationPlan: undefined,
    dateOfFormation: dayjs().format("YYYY-MM"),
    entityId: "",
    employerId: "",
    taxId: "",
    notes: `some-notes-${randomInt()}`,
    ...overrides,
  };
};

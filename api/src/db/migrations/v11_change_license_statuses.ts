import { v10UserData } from "./v10_add_mynjuserkey";
import { randomInt } from "./migrations";

export interface v11UserData {
  user: v11BusinessUser;
  onboardingData: v11OnboardingData;
  formProgress: v11FormProgress;
  taskProgress: Record<string, v11TaskProgress>;
  licenseData: v11LicenseData | undefined;
  version: number;
}

export const migrate_v10_to_v11 = (v10Data: v10UserData): v11UserData => {
  return {
    ...v10Data,
    version: 11,
  };
};

// ---------------- v11 types ----------------

type v11TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v11FormProgress = "UNSTARTED" | "COMPLETED";

type v11BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v11OnboardingData {
  businessName: string;
  industry: v11Industry | undefined;
  legalStructure: v11LegalStructure | undefined;
  municipality: v11Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
}

export type v11Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v11Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
type v11LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation"
  | "s-corporation";

type v11NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v11LicenseData = {
  nameAndAddress: v11NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v11LicenseStatus;
  items: v11LicenseStatusItem[];
};

export type v11LicenseStatusItem = {
  title: string;
  status: v11CheckoffStatus;
};

export type v11CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v11LicenseStatus =
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

// ---------------- v11 factories ----------------

export const generatev11User = (overrides: Partial<v11BusinessUser>): v11BusinessUser => {
  return {
    name: "some-name-" + randomInt(),
    email: `some-email-${randomInt()}@example.com`,
    id: "some-id-" + randomInt(),
    ...overrides,
  };
};

export const generatev11OnboardingData = (overrides: Partial<v11OnboardingData>): v11OnboardingData => {
  return {
    businessName: "some-business-name-" + randomInt(),
    industry: "restaurant",
    legalStructure: "sole-proprietorship",
    municipality: {
      name: "some-name-" + randomInt(),
      displayName: "some-display-name-" + randomInt(),
      county: "some-county-" + randomInt(),
      id: "some-id-" + randomInt(),
    },
    liquorLicense: true,
    homeBasedBusiness: true,
    ...overrides,
  };
};

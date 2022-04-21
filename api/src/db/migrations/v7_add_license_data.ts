import { randomInt } from "@shared/intHelpers";
import { v6UserData } from "./v6_add_home_based_business";

export interface v7UserData {
  user: v7BusinessUser;
  onboardingData: v7OnboardingData;
  formProgress: v7FormProgress;
  taskProgress: Record<string, v7TaskProgress>;
  licenseSearchData: v7LicenseSearchData | undefined;
  version: number;
}

export const migrate_v6_to_v7 = (v6Data: v6UserData): v7UserData => {
  return {
    ...v6Data,
    licenseSearchData: undefined,
    version: 7,
  };
};

// ---------------- v7 types ----------------

type v7TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v7FormProgress = "UNSTARTED" | "COMPLETED";

type v7BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

interface v7OnboardingData {
  businessName: string;
  industry: v7Industry | undefined;
  legalStructure: v7LegalStructure | undefined;
  municipality: v7Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
}

export type v7Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v7Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
type v7LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation"
  | "s-corporation"
  | "b-corporation";

type v7NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v7LicenseSearchData = {
  nameAndAddress: v7NameAndAddress;
  completedSearch: boolean;
};

// ---------------- v7 factories ----------------

export const generateV7User = (overrides: Partial<v7BusinessUser>): v7BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generateV7OnboardingData = (overrides: Partial<v7OnboardingData>): v7OnboardingData => {
  return {
    businessName: `some-business-name-${randomInt()}`,
    industry: "restaurant",
    legalStructure: "sole-proprietorship",
    municipality: {
      name: `some-name-${randomInt()}`,
      displayName: `some-display-name-${randomInt()}`,
      county: `some-county-${randomInt()}`,
      id: `some-id-${randomInt()}`,
    },
    liquorLicense: true,
    homeBasedBusiness: true,
    ...overrides,
  };
};

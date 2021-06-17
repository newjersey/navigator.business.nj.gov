import {v7UserData} from "./v7_add_license_data";
import {randomInt} from "./migrations";

export interface v8UserData {
  user: v8BusinessUser;
  onboardingData: v8OnboardingData;
  formProgress: v8FormProgress;
  taskProgress: Record<string, v8TaskProgress>;
  licenseSearchData: v8LicenseSearchData | undefined;
  version: number;
}

export const migrate_v7_to_v8 = (v7Data: v7UserData): v8UserData => {

  let newLegalStructure;
  if (v7Data.onboardingData.legalStructure === "b-corporation") {
    newLegalStructure = undefined;
  } else {
    newLegalStructure = v7Data.onboardingData.legalStructure;
  }

  return {
    ...v7Data,
    onboardingData: {
      ...v7Data.onboardingData,
      legalStructure: newLegalStructure,
    },
    version: 8
  };
};

// ---------------- v8 types ----------------

type v8TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v8FormProgress = "UNSTARTED" | "COMPLETED";

type v8BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

interface v8OnboardingData {
  businessName: string;
  industry: v8Industry | undefined;
  legalStructure: v8LegalStructure | undefined;
  municipality: v8Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
}

export type v8Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v8Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
type v8LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation"
  | "s-corporation";

type v8NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
}

export type v8LicenseSearchData = {
  nameAndAddress: v8NameAndAddress;
  completedSearch: boolean;
}


// ---------------- v8 factories ----------------


export const generateV8User = (overrides: Partial<v8BusinessUser>): v8BusinessUser => {
  return {
    name: "some-name-" + randomInt(),
    email: `some-email-${randomInt()}@example.com`,
    id: "some-id-" + randomInt(),
    ...overrides,
  };
};

export const generateV8OnboardingData = (overrides: Partial<v8OnboardingData>): v8OnboardingData => {
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

export const generateV8LicenseSearchData = (overrides: Partial<v8LicenseSearchData>): v8LicenseSearchData => {
  return {
    nameAndAddress: generateV8NameAndAddress({}),
    completedSearch: false,
    ...overrides
  }
}

export const generateV8NameAndAddress = (overrides: Partial<v8NameAndAddress>): v8NameAndAddress => {
  return {
    name: "some-name-" + randomInt(),
    addressLine1: "some-address-1-" + randomInt(),
    addressLine2: "some-address-2-" + randomInt(),
    zipCode: "some-zipcode-" + randomInt(),
    ...overrides,
  };
};

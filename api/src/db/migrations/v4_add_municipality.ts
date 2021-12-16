import { randomInt } from "./migrations";
import { v3UserData } from "./v3_change_LegalStructure";

export interface v4UserData {
  user: v4BusinessUser;
  onboardingData: v4OnboardingData;
  formProgress: v4FormProgress;
  taskProgress: Record<string, v4TaskProgress>;
  version: number;
}

export const migrate_v3_to_v4 = (v3Data: v3UserData): v4UserData => {
  return {
    ...v3Data,
    onboardingData: {
      ...v3Data.onboardingData,
      municipality: undefined,
    },
    version: 4,
  };
};

// ---------------- v4 types ----------------

type v4TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v4FormProgress = "UNSTARTED" | "COMPLETED";

type v4BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

interface v4OnboardingData {
  businessName: string;
  industry: v4Industry;
  legalStructure: v4LegalStructure | undefined;
  municipality: v4Municipality | undefined;
}

export type v4Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v4Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
type v4LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation"
  | "s-corporation"
  | "b-corporation";

// ---------------- v4 factories ----------------

export const generateV4User = (overrides: Partial<v4BusinessUser>): v4BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generateV4OnboardingData = (overrides: Partial<v4OnboardingData>): v4OnboardingData => {
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
    ...overrides,
  };
};

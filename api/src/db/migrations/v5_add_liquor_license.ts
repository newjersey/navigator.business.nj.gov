import { v4UserData } from "./v4_add_municipality";

export interface v5UserData {
  user: v5BusinessUser;
  onboardingData: v5OnboardingData;
  formProgress: v5FormProgress;
  taskProgress: Record<string, v5TaskProgress>;
  version: number;
}

export const migrate_v4_to_v5 = (v4Data: v4UserData): v5UserData => {
  return {
    ...v4Data,
    onboardingData: {
      ...v4Data.onboardingData,
      liquorLicense: false,
    },
    version: 5,
  };
};

// ---------------- v5 types ----------------

type v5TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v5FormProgress = "UNSTARTED" | "COMPLETED";

type v5BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

interface v5OnboardingData {
  businessName: string;
  industry: v5Industry | undefined;
  legalStructure: v5LegalStructure | undefined;
  municipality: v5Municipality | undefined;
  liquorLicense: boolean;
}

export type v5Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v5Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
type v5LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation"
  | "s-corporation"
  | "b-corporation";

// ---------------- v5 factories ----------------

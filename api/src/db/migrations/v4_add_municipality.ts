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

import {v5UserData} from "./v5_add_liquor_license";

export interface v6UserData {
  user: v6BusinessUser;
  onboardingData: v6OnboardingData;
  formProgress: v6FormProgress;
  taskProgress: Record<string, v6TaskProgress>;
  version: number;
}

export const migrate_v5_to_v6 = (v5Data: v5UserData): v6UserData => {
  return {
    ...v5Data,
    onboardingData: {
      ...v5Data.onboardingData,
      homeBasedBusiness: false
    },
    version: 6,
  };
};

// ---------------- v6 types ----------------

type v6TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v6FormProgress = "UNSTARTED" | "COMPLETED";

type v6BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

interface v6OnboardingData {
  businessName: string;
  industry: v6Industry | undefined;
  legalStructure: v6LegalStructure | undefined;
  municipality: v6Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
}

export type v6Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v6Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
type v6LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation"
  | "s-corporation"
  | "b-corporation";

// ---------------- v6 factories ----------------

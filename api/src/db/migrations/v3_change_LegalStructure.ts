import { v2LegalStructure, v2UserData } from "./v2_formData_to_onboardingData";

export interface v3UserData {
  user: v3BusinessUser;
  onboardingData: v3OnboardingData;
  formProgress: v3FormProgress;
  taskProgress: Record<string, v3TaskProgress>;
  version: number;
}

export const migrate_v2_to_v3 = (v2Data: v2UserData): v3UserData => {
  const legalStructureMapping: Record<v2LegalStructure, v3LegalStructure> = {
    "Sole Proprietorship": "sole-proprietorship",
    "General Partnership": "general-partnership",
    "Limited Partnership (LP)": "limited-partnership",
    "Limited Liability Partnership (LLP)": "limited-liability-partnership",
    "Limited Liability Company (LLC)": "limited-liability-company",
    "C-Corporation": "c-corporation",
    "S-Corporation": "s-corporation",
    "B-Corporation": "b-corporation",
  };

  return {
    ...v2Data,
    onboardingData: {
      ...v2Data.onboardingData,
      legalStructure: v2Data.onboardingData.legalStructure
        ? legalStructureMapping[v2Data.onboardingData.legalStructure]
        : undefined,
    },
    version: 3,
  };
};

// ---------------- v3 types ----------------

type v3TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v3FormProgress = "UNSTARTED" | "COMPLETED";

type v3BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

interface v3OnboardingData {
  businessName: string;
  industry: v3Industry;
  legalStructure: v3LegalStructure | undefined;
}

type v3Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
type v3LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation"
  | "s-corporation"
  | "b-corporation";

// ---------------- v3 factories ----------------

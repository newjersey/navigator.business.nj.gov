import { randomInt } from "./migrations";
import { v1UserData } from "./v1_addTaskProgress";

export interface v2UserData {
  user: v2BusinessUser;
  onboardingData: v2OnboardingData;
  formProgress: v2FormProgress;
  taskProgress: Record<string, v2TaskProgress>;
  version: number;
}

export const migrate_v1_to_v2 = (v1Data: v1UserData): v2UserData => {
  const { formData, ...rest } = v1Data;
  let businessName = "";
  if (formData.businessName && formData.businessName.businessName) {
    businessName = formData.businessName.businessName;
  }
  let industry = "generic";
  if (formData.businessType && formData.businessType.businessType) {
    industry = formData.businessType.businessType;
  }
  let legalStructure = undefined;
  if (formData.businessStructure && formData.businessStructure.businessStructure) {
    legalStructure = formData.businessStructure.businessStructure;
  }
  return {
    ...rest,
    onboardingData: {
      businessName,
      industry: industry as v2Industry,
      legalStructure,
    },
    version: 2,
  };
};

// ---------------- v2 types ----------------

type v2TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

type v2FormProgress = "UNSTARTED" | "COMPLETED";

type v2BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

interface v2OnboardingData {
  businessName: string;
  industry: v2Industry;
  legalStructure: v2LegalStructure | undefined;
}

type v2Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
export type v2LegalStructure =
  | "Sole Proprietorship"
  | "General Partnership"
  | "Limited Partnership (LP)"
  | "Limited Liability Partnership (LLP)"
  | "Limited Liability Company (LLC)"
  | "C-Corporation"
  | "S-Corporation"
  | "B-Corporation";

// ---------------- v2 factories ----------------

export const generateV2OnboardingData = (overrides: Partial<v2OnboardingData>): v2OnboardingData => {
  return {
    businessName: `some-business-name-${randomInt()}`,
    industry: "restaurant",
    legalStructure: "Sole Proprietorship",
    ...overrides,
  };
};

export const generateV2User = (overrides: Partial<v2BusinessUser>): v2BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

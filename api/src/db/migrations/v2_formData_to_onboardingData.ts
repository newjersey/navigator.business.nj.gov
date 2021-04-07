import { BusinessUser, FormProgress, Industry, OnboardingData, TaskProgress } from "../../domain/types";
import { v1UserData } from "./v1_addTaskProgress";

export interface v2UserData {
  user: BusinessUser;
  onboardingData: OnboardingData;
  formProgress: FormProgress;
  taskProgress: Record<string, TaskProgress>;
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
      industry: industry as Industry,
      legalStructure,
    },
    version: 2,
  };
};

// below - old BusinessForm data type

export type Restaurant = "restaurant";
export type ECommerce = "e-commerce";
export type HomeImprovementContractor = "home-contractor";
export type Cosmetology = "cosmetology";

export interface BusinessForm {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    [k: string]: unknown;
  };
  businessType?: {
    businessType?: (Restaurant | ECommerce | HomeImprovementContractor | Cosmetology) & string;
    [k: string]: unknown;
  };
  businessName?: {
    businessName?: string;
    [k: string]: unknown;
  };
  businessDescription?: {
    businessDescription?: string;
    [k: string]: unknown;
  };
  businessStructure?: {
    businessStructure?:
      | "Sole Proprietorship"
      | "General Partnership"
      | "Limited Partnership (LP)"
      | "Limited Liability Partnership (LLP)"
      | "Limited Liability Company (LLC)"
      | "C-Corporation"
      | "S-Corporation"
      | "B-Corporation";
    [k: string]: unknown;
  };
  locations?: {
    locations?: [
      {
        zipCode?: string;
        license?: boolean;
        [k: string]: unknown;
      },
      ...{
        zipCode?: string;
        license?: boolean;
        [k: string]: unknown;
      }[]
    ];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

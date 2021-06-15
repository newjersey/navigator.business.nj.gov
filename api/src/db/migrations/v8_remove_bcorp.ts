import { v7UserData } from "./v7_add_license_data";

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
  if(v7Data.onboardingData.legalStructure === "b-corporation"){
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

type v8LicenseSearchData = {
  nameAndAddress: v8NameAndAddress;
  completedSearch: boolean;
}


// ---------------- v8 factories ----------------

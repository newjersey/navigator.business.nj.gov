import {v9UserData} from "./v9_add_license_status_to_data";

export interface v10UserData {
  user: v10BusinessUser;
  onboardingData: v10OnboardingData;
  formProgress: v10FormProgress;
  taskProgress: Record<string, v10TaskProgress>;
  licenseData: v10LicenseData | undefined;
  version: number;
}

export const migrate_v9_to_v10 = (v9Data: v9UserData): v10UserData => {
  return {
    ...v9Data,
    user: {
      ...v9Data.user,
      myNJUserKey: undefined,
    },
    version: 10
  };
};

// ---------------- v10 types ----------------

type v10TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v10FormProgress = "UNSTARTED" | "COMPLETED";

type v10BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v10OnboardingData {
  businessName: string;
  industry: v10Industry | undefined;
  legalStructure: v10LegalStructure | undefined;
  municipality: v10Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
}

export type v10Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v10Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
type v10LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation"
  | "s-corporation";

type v10NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
}

type v10LicenseData = {
  nameAndAddress: v10NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v10LicenseStatus;
  items: v10LicenseStatusItem[];
}

export type v10LicenseStatusItem = {
  title: string;
  status: v10LicenseStatus;
};

export type v10LicenseStatus = "ACTIVE" | "PENDING" | "UNKNOWN";


// ---------------- v10 factories ----------------

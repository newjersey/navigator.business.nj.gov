import { v12UserData } from "./v12_remove_scorp";

export interface v13UserData {
  user: v13BusinessUser;
  onboardingData: v13OnboardingData;
  formProgress: v13FormProgress;
  taskProgress: Record<string, v13TaskProgress>;
  licenseData: v13LicenseData | undefined;
  version: number;
}

export const migrate_v12_to_v13 = (v12Data: v12UserData): v13UserData => {
  return {
    ...v12Data,
    onboardingData: {
      constructionRenovationPlan: undefined,
      ...v12Data.onboardingData,
    },
    version: 13,
  };
};

// ---------------- v13 types ----------------

type v13TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v13FormProgress = "UNSTARTED" | "COMPLETED";

type v13BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v13OnboardingData {
  businessName: string;
  industry: v13Industry | undefined;
  legalStructure: v13LegalStructure | undefined;
  municipality: v13Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
}

export type v13Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v13Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
type v13LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation";

type v13NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v13LicenseData = {
  nameAndAddress: v13NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v13LicenseStatus;
  items: v13LicenseStatusItem[];
};

export type v13LicenseStatusItem = {
  title: string;
  status: v13CheckoffStatus;
};

export type v13CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v13LicenseStatus =
  | "ACTIVE"
  | "PENDING"
  | "UNKNOWN"
  | "EXPIRED"
  | "BARRED"
  | "OUT_OF_BUSINESS"
  | "REINSTATEMENT_PENDING"
  | "CLOSED"
  | "DELETED"
  | "DENIED"
  | "VOLUNTARY_SURRENDER"
  | "WITHDRAWN";

// ---------------- v13 factories ----------------

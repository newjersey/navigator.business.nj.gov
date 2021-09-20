import { v13UserData } from "./v13_add_constructionRenovationPlan";

export interface v14UserData {
  user: v14BusinessUser;
  onboardingData: v14OnboardingData;
  formProgress: v14FormProgress;
  taskProgress: Record<string, v14TaskProgress>;
  licenseData: v14LicenseData | undefined;
  version: number;
}

export const migrate_v13_to_v14 = (v13Data: v13UserData): v14UserData => {
  return {
    ...v13Data,
    version: 14,
  };
};

// ---------------- v14 types ----------------

type v14TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v14FormProgress = "UNSTARTED" | "COMPLETED";

type v14BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v14OnboardingData {
  businessName: string;
  industry: v14Industry | undefined;
  legalStructure: v14LegalStructure | undefined;
  municipality: v14Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
}

export type v14Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v14Industry =
  | "restaurant"
  | "e-commerce"
  | "home-contractor"
  | "cosmetology"
  | "cleaning-aid"
  | "generic";
type v14LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation";

type v14NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v14LicenseData = {
  nameAndAddress: v14NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v14LicenseStatus;
  items: v14LicenseStatusItem[];
};

export type v14LicenseStatusItem = {
  title: string;
  status: v14CheckoffStatus;
};

export type v14CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v14LicenseStatus =
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

// ---------------- v14 factories ----------------

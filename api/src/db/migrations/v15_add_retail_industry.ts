import { v14UserData } from "./v14_add_cleaning_aid_industry";

export interface v15UserData {
  user: v15BusinessUser;
  onboardingData: v15OnboardingData;
  formProgress: v15FormProgress;
  taskProgress: Record<string, v15TaskProgress>;
  licenseData: v15LicenseData | undefined;
  version: number;
}

export const migrate_v14_to_v15 = (v14Data: v14UserData): v15UserData => {
  return {
    ...v14Data,
    version: 15,
  };
};

// ---------------- v15 types ----------------

type v15TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v15FormProgress = "UNSTARTED" | "COMPLETED";

type v15BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v15OnboardingData {
  businessName: string;
  industry: v15Industry | undefined;
  legalStructure: v15LegalStructure | undefined;
  municipality: v15Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
}

export type v15Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v15Industry =
  | "restaurant"
  | "e-commerce"
  | "home-contractor"
  | "cosmetology"
  | "cleaning-aid"
  | "retail"
  | "generic";

type v15LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation";

type v15NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v15LicenseData = {
  nameAndAddress: v15NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v15LicenseStatus;
  items: v15LicenseStatusItem[];
};

export type v15LicenseStatusItem = {
  title: string;
  status: v15CheckoffStatus;
};

export type v15CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v15LicenseStatus =
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

// ---------------- v15 factories ----------------

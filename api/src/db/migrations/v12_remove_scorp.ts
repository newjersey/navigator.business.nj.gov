import { v11UserData } from "./v11_change_license_statuses";

export interface v12UserData {
  user: v12BusinessUser;
  onboardingData: v12OnboardingData;
  formProgress: v12FormProgress;
  taskProgress: Record<string, v12TaskProgress>;
  licenseData: v12LicenseData | undefined;
  version: number;
}

export const migrate_v11_to_v12 = (v11Data: v11UserData): v12UserData => {

  let newLegalStructure;
  if(v11Data.onboardingData.legalStructure === "s-corporation"){
    newLegalStructure = undefined;
  } else {
    newLegalStructure = v11Data.onboardingData.legalStructure;
  }

  return {
    ...v11Data,
    onboardingData: {
      ...v11Data.onboardingData,
      legalStructure: newLegalStructure,
    },
    version: 12
  };
};


// ---------------- v12 types ----------------

type v12TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v12FormProgress = "UNSTARTED" | "COMPLETED";

type v12BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

interface v12OnboardingData {
  businessName: string;
  industry: v12Industry | undefined;
  legalStructure: v12LegalStructure | undefined;
  municipality: v12Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
}

export type v12Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v12Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
type v12LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation";
  
type v12NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
}

type v12LicenseData = {
  nameAndAddress: v12NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v12LicenseStatus;
  items: v12LicenseStatusItem[];
}

export type v12LicenseStatusItem = {
  title: string;
  status: v12CheckoffStatus;
};

export type v12CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v12LicenseStatus = "ACTIVE" | "PENDING" | "UNKNOWN" | "EXPIRED" | "BARRED" | "OUT_OF_BUSINESS" | 
"REINSTATEMENT_PENDING" | "CLOSED" | "DELETED" | "DENIED" | "VOLUNTARY_SURRENDER" | "WITHDRAWN";



// ---------------- v12 factories ----------------

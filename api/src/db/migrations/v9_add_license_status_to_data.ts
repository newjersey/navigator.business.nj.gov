import { v8UserData } from "./v8_remove_bcorp";
import dayjs from "dayjs";

export interface v9UserData {
  user: v9BusinessUser;
  onboardingData: v9OnboardingData;
  formProgress: v9FormProgress;
  taskProgress: Record<string, v9TaskProgress>;
  licenseData: v9LicenseData | undefined;
  version: number;
}

export const migrate_v8_to_v9 = (v8Data: v8UserData): v9UserData => {
  let licenseData: v9LicenseData | undefined;
  if (!v8Data.licenseSearchData) {
    licenseData = undefined;
  } else {
    licenseData = {
      nameAndAddress: v8Data.licenseSearchData.nameAndAddress,
      completedSearch: v8Data.licenseSearchData.completedSearch,
      lastCheckedStatus: dayjs(0).toISOString(),
      status: "UNKNOWN",
      items: [],
    };
  }

  return {
    ...v8Data,
    licenseData,
    version: 9,
  };
};

// ---------------- v9 types ----------------

type v9TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v9FormProgress = "UNSTARTED" | "COMPLETED";

type v9BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

interface v9OnboardingData {
  businessName: string;
  industry: v9Industry | undefined;
  legalStructure: v9LegalStructure | undefined;
  municipality: v9Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
}

export type v9Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v9Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
type v9LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation"
  | "s-corporation";

type v9NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v9LicenseData = {
  nameAndAddress: v9NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v9LicenseStatus;
  items: v9LicenseStatusItem[];
};

export type v9LicenseStatusItem = {
  title: string;
  status: v9LicenseStatus;
};

export type v9LicenseStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

// ---------------- v9 factories ----------------

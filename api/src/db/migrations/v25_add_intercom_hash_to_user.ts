import { createHmac } from "crypto";
import { v24UserData } from "./v24_restructure_tax_filings";

export interface v25UserData {
  user: v25BusinessUser;
  profileData: v25ProfileData;
  formProgress: v25FormProgress;
  taskProgress: Record<string, v25TaskProgress>;
  licenseData: v25LicenseData | undefined;
  preferences: v25Preferences;
  taxFilingData: v25TaxFilingData;
  version: number;
}

export const migrate_v24_to_v25 = (v24Data: v24UserData): v25UserData => {
  let intercomHash;

  if (v24Data.user.myNJUserKey) {
    intercomHash = createHmac("sha256", process.env.INTERCOM_HASH_SECRET || "")
      .update(v24Data.user.myNJUserKey)
      .digest("hex");
  }

  const userData = {
    ...v24Data,
    user: {
      ...v24Data.user,
      intercomHash,
    },
    version: 25,
  };

  return userData;
};

// ---------------- v25 types ----------------

type v25TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v25FormProgress = "UNSTARTED" | "COMPLETED";

type v25BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v25ProfileData {
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v25Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
}

export type v25Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v25TaxFilingData = {
  entityIdStatus: v25EntityIdStatus;
  filings: v25TaxFiling[];
};

export type v25EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

export type v25TaxFiling = {
  identifier: string;
  dueDate: string;
};
type v25NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v25LicenseData = {
  nameAndAddress: v25NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v25LicenseStatus;
  items: v25LicenseStatusItem[];
};

type v25Preferences = {
  roadmapOpenSections: v25SectionType[];
  roadmapOpenSteps: number[];
};

export type v25LicenseStatusItem = {
  title: string;
  status: v25CheckoffStatus;
};

export type v25CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v25LicenseStatus =
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

export type v25SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v25 factories ----------------

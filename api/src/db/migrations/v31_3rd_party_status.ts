import { v30UserData } from "./v30_add_existingEmployees";

export interface v31UserData {
  user: v31BusinessUser;
  profileData: v31ProfileData;
  formProgress: v31FormProgress;
  taskProgress: Record<string, v31TaskProgress>;
  licenseData: v31LicenseData | undefined;
  preferences: v31Preferences;
  taxFilingData: v31TaxFilingData;
  version: number;
}

export const newsletterStatusList = [
  "SUCCESS",
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "RESPONSE_WARNING",
  "QUESTION_WARNING",
] as const;

export type v31NewsletterStatus = typeof newsletterStatusList[number];

export interface v31NewsletterResponse {
  success: boolean;
  status: v31NewsletterStatus;
}

export type v31ExternalStatus = {
  newsletter?: v31NewsletterResponse;
};
export const migrate_v30_to_v31 = (v30Data: v30UserData): v31UserData => {
  return {
    ...v30Data,
    user: {
      ...v30Data.user,
      externalStatus: {},
    },
    version: 31,
  };
};

// ---------------- v31 types ----------------

type v31TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v31FormProgress = "UNSTARTED" | "COMPLETED";

type v31BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v31ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v31ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v31Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  certificationIds: string[];
  existingEmployees: string | undefined;
}

export type v31Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v31TaxFilingData = {
  entityIdStatus: v31EntityIdStatus;
  filings: v31TaxFiling[];
};

export type v31EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

export type v31TaxFiling = {
  identifier: string;
  dueDate: string;
};
type v31NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v31LicenseData = {
  nameAndAddress: v31NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v31LicenseStatus;
  items: v31LicenseStatusItem[];
};

type v31Preferences = {
  roadmapOpenSections: v31SectionType[];
  roadmapOpenSteps: number[];
};

export type v31LicenseStatusItem = {
  title: string;
  status: v31CheckoffStatus;
};

export type v31CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v31LicenseStatus =
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

export type v31SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v31 factories ----------------

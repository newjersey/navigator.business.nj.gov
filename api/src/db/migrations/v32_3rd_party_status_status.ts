import { v31UserData } from "./v31_3rd_party_status";

export interface v32UserData {
  user: v32BusinessUser;
  profileData: v32ProfileData;
  formProgress: v32FormProgress;
  taskProgress: Record<string, v32TaskProgress>;
  licenseData: v32LicenseData | undefined;
  preferences: v32Preferences;
  taxFilingData: v32TaxFilingData;
  version: number;
}
export type v32ExternalStatus = {
  newsletter?: v32NewsletterResponse;
  userTesting?: v32UserTestingResponse;
};

export interface v32NewsletterResponse {
  success?: boolean;
  status: v32NewsletterStatus;
}

export interface v32UserTestingResponse {
  success?: boolean;
  status: v32UserTestingStatus;
}

export type v32NewsletterStatus = typeof newsletterStatusList[number];

export const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

export const userTestingStatusList = [...externalStatusList] as const;

export type v32UserTestingStatus = typeof userTestingStatusList[number];

export const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

export const migrate_v31_to_v32 = (v31Data: v31UserData): v32UserData => {
  return {
    ...v31Data,
    user: {
      ...v31Data.user,
      externalStatus: {
        ...v31Data.user.externalStatus,
        userTesting: v31Data.user.externalStatus.userTesting
          ? {
              success: v31Data.user.externalStatus.userTesting.success,
              status: v31Data.user.externalStatus.userTesting.success ? "SUCCESS" : "CONNECTION_ERROR",
            }
          : undefined,
      },
    },
    version: 32,
  };
};

// ---------------- v32 types ----------------

type v32TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v32FormProgress = "UNSTARTED" | "COMPLETED";

type v32BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v32ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v32ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v32Municipality | undefined;
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

export type v32Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type v32TaxFilingData = {
  entityIdStatus: v32EntityIdStatus;
  filings: v32TaxFiling[];
};

export type v32EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

export type v32TaxFiling = {
  identifier: string;
  dueDate: string;
};
type v32NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v32LicenseData = {
  nameAndAddress: v32NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v32LicenseStatus;
  items: v32LicenseStatusItem[];
};

type v32Preferences = {
  roadmapOpenSections: v32SectionType[];
  roadmapOpenSteps: number[];
};

export type v32LicenseStatusItem = {
  title: string;
  status: v32CheckoffStatus;
};

export type v32CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type v32LicenseStatus =
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

export type v32SectionType = "PLAN" | "START" | "OPERATE";

// ---------------- v32 factories ----------------

import { v33UserData } from "./v33_formation_data";

export interface v34UserData {
  user: v34BusinessUser;
  profileData: v34ProfileData;
  formProgress: v34FormProgress;
  taskProgress: Record<string, v34TaskProgress>;
  licenseData: v34LicenseData | undefined;
  preferences: v34Preferences;
  taxFilingData: v34TaxFilingData;
  formationData: v34FormationData;
  version: number;
}

export const migrate_v33_to_v34 = (v33Data: v33UserData): v34UserData => {
  return {
    ...v33Data,
    formationData: {
      formationFormData: {
        ...v33Data.formationData.formationFormData,
        contactFirstName: "",
        contactLastName: "",
        contactPhoneNumber: "",
      },
      formationResponse: v33Data.formationData.formationResponse,
    },
    version: 34,
  };
};

// ---------------- v34 types ----------------

type v34TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v34FormProgress = "UNSTARTED" | "COMPLETED";

type v34BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v34ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v34ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v34Municipality | undefined;
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

type v34Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v34TaxFilingData = {
  entityIdStatus: v34EntityIdStatus;
  filings: v34TaxFiling[];
};

type v34EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

type v34TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v34NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v34LicenseData = {
  nameAndAddress: v34NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v34LicenseStatus;
  items: v34LicenseStatusItem[];
};

type v34Preferences = {
  roadmapOpenSections: v34SectionType[];
  roadmapOpenSteps: number[];
};

type v34LicenseStatusItem = {
  title: string;
  status: v34CheckoffStatus;
};

type v34CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v34LicenseStatus =
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

type v34SectionType = "PLAN" | "START" | "OPERATE";

type v34ExternalStatus = {
  newsletter?: v34NewsletterResponse;
  userTesting?: v34UserTestingResponse;
};

interface v34NewsletterResponse {
  success?: boolean;
  status: v34NewsletterStatus;
}

interface v34UserTestingResponse {
  success?: boolean;
  status: v34UserTestingStatus;
}

type v34NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v34UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v34FormationData {
  formationFormData: v34FormationFormData;
  formationResponse: v34FormationSubmitResponse | undefined;
}

interface v34FormationFormData {
  businessSuffix: v34BusinessSuffix | undefined;
  businessStartDate: string;
  businessAddressLine1: string;
  businessAddressLine2: string;
  businessAddressState: string;
  businessAddressZipCode: string;
  agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  agentNumber: string;
  agentName: string;
  agentEmail: string;
  agentOfficeAddressLine1: string;
  agentOfficeAddressLine2: string;
  agentOfficeAddressCity: string;
  agentOfficeAddressState: string;
  agentOfficeAddressZipCode: string;
  signer: string;
  additionalSigners: string[];
  paymentType: v34PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v34PaymentType = "CC" | "ACH" | undefined;

type v34BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v34FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  redirect: string | undefined;
  errors: v34FormationSubmitError[];
};

type v34FormationSubmitError = {
  field: string;
  message: string;
};

// ---------------- v34 factories ----------------

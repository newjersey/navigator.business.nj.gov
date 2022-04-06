import { v46UserData } from "./v46_add_task_item_checklist";

export interface v47UserData {
  user: v47BusinessUser;
  profileData: v47ProfileData;
  formProgress: v47FormProgress;
  taskProgress: Record<string, v47TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v47LicenseData | undefined;
  preferences: v47Preferences;
  taxFilingData: v47TaxFilingData;
  formationData: v47FormationData;
  version: number;
}

export const migrate_v46_to_v47 = (v46Data: v46UserData): v47UserData => {
  return {
    ...v46Data,
    profileData: {
      ...v46Data.profileData,
      documents: { certifiedDoc: "", formationDoc: "", standingDoc: "" },
    },
    version: 47,
  };
};

// ---------------- v47 types ----------------

type v47TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v47FormProgress = "UNSTARTED" | "COMPLETED";

type v47BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v47ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v47ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}
interface v47ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v47Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v47ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
}

type v47Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v47TaxFilingData = {
  filings: v47TaxFiling[];
};

type v47TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v47NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v47LicenseData = {
  nameAndAddress: v47NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v47LicenseStatus;
  items: v47LicenseStatusItem[];
};

type v47Preferences = {
  roadmapOpenSections: v47SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v47LicenseStatusItem = {
  title: string;
  status: v47CheckoffStatus;
};

type v47CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v47LicenseStatus =
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

type v47SectionType = "PLAN" | "START";

type v47ExternalStatus = {
  newsletter?: v47NewsletterResponse;
  userTesting?: v47UserTestingResponse;
};

interface v47NewsletterResponse {
  success?: boolean;
  status: v47NewsletterStatus;
}

interface v47UserTestingResponse {
  success?: boolean;
  status: v47UserTestingStatus;
}

type v47NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v47UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v47FormationData {
  formationFormData: v47FormationFormData;
  formationResponse: v47FormationSubmitResponse | undefined;
  getFilingResponse: v47GetFilingResponse | undefined;
}

interface v47FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v47FormationFormData {
  businessSuffix: v47BusinessSuffix | undefined;
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
  members: v47FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v47PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v47PaymentType = "CC" | "ACH" | undefined;

type v47BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v47FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v47FormationSubmitError[];
};

type v47FormationSubmitError = {
  field: string;
  message: string;
};

type v47GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v47 factories ----------------

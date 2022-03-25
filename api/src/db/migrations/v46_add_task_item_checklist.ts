import { v45UserData } from "./v45_add_hidden_opportunities_to_preferences";

export interface v46UserData {
  user: v46BusinessUser;
  profileData: v46ProfileData;
  formProgress: v46FormProgress;
  taskProgress: Record<string, v46TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v46LicenseData | undefined;
  preferences: v46Preferences;
  taxFilingData: v46TaxFilingData;
  formationData: v46FormationData;
  version: number;
}

export const migrate_v45_to_v46 = (v45Data: v45UserData): v46UserData => {
  return {
    ...v45Data,
    taskItemChecklist: {},
    version: 46,
  };
};

// ---------------- v46 types ----------------

type v46TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v46FormProgress = "UNSTARTED" | "COMPLETED";

type v46BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v46ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v46ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v46Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
}

type v46Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v46TaxFilingData = {
  filings: v46TaxFiling[];
};

type v46TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v46NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v46LicenseData = {
  nameAndAddress: v46NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v46LicenseStatus;
  items: v46LicenseStatusItem[];
};

type v46Preferences = {
  roadmapOpenSections: v46SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v46LicenseStatusItem = {
  title: string;
  status: v46CheckoffStatus;
};

type v46CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v46LicenseStatus =
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

type v46SectionType = "PLAN" | "START";

type v46ExternalStatus = {
  newsletter?: v46NewsletterResponse;
  userTesting?: v46UserTestingResponse;
};

interface v46NewsletterResponse {
  success?: boolean;
  status: v46NewsletterStatus;
}

interface v46UserTestingResponse {
  success?: boolean;
  status: v46UserTestingStatus;
}

type v46NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v46UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v46FormationData {
  formationFormData: v46FormationFormData;
  formationResponse: v46FormationSubmitResponse | undefined;
  getFilingResponse: v46GetFilingResponse | undefined;
}

interface v46FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v46FormationFormData {
  businessSuffix: v46BusinessSuffix | undefined;
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
  members: v46FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v46PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v46PaymentType = "CC" | "ACH" | undefined;

type v46BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v46FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v46FormationSubmitError[];
};

type v46FormationSubmitError = {
  field: string;
  message: string;
};

type v46GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v46 factories ----------------

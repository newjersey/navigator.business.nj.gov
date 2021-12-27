import { v32UserData } from "./v32_3rd_party_status_status";

export interface v33UserData {
  user: v33BusinessUser;
  profileData: v33ProfileData;
  formProgress: v33FormProgress;
  taskProgress: Record<string, v33TaskProgress>;
  licenseData: v33LicenseData | undefined;
  preferences: v33Preferences;
  taxFilingData: v33TaxFilingData;
  formationData: v33FormationData;
  version: number;
}

export const migrate_v32_to_v33 = (v32Data: v32UserData): v33UserData => {
  return {
    ...v32Data,
    formationData: {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
    },
    version: 33,
  };
};

// ---------------- v33 types ----------------

type v33TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v33FormProgress = "UNSTARTED" | "COMPLETED";

type v33BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v33ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v33ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v33Municipality | undefined;
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

type v33Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v33TaxFilingData = {
  entityIdStatus: v33EntityIdStatus;
  filings: v33TaxFiling[];
};

type v33EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

type v33TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v33NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v33LicenseData = {
  nameAndAddress: v33NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v33LicenseStatus;
  items: v33LicenseStatusItem[];
};

type v33Preferences = {
  roadmapOpenSections: v33SectionType[];
  roadmapOpenSteps: number[];
};

type v33LicenseStatusItem = {
  title: string;
  status: v33CheckoffStatus;
};

type v33CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v33LicenseStatus =
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

type v33SectionType = "PLAN" | "START" | "OPERATE";

type v33ExternalStatus = {
  newsletter?: v33NewsletterResponse;
  userTesting?: v33UserTestingResponse;
};

interface v33NewsletterResponse {
  success?: boolean;
  status: v33NewsletterStatus;
}

interface v33UserTestingResponse {
  success?: boolean;
  status: v33UserTestingStatus;
}

type v33NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v33UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v33FormationData {
  formationFormData: v33FormationFormData;
  formationResponse: v33FormationSubmitResponse | undefined;
}

interface v33FormationFormData {
  businessSuffix: v33BusinessSuffix | undefined;
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
  paymentType: v33PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
}

type v33PaymentType = "CC" | "ACH" | undefined;

type v33BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v33FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  redirect: string | undefined;
  errors: v33FormationSubmitError[];
};

type v33FormationSubmitError = {
  field: string;
  message: string;
};

// ---------------- v33 factories ----------------

const createEmptyFormationFormData = (): v33FormationFormData => {
  return {
    businessSuffix: undefined,
    businessStartDate: "",
    businessAddressLine1: "",
    businessAddressLine2: "",
    businessAddressState: "NJ",
    businessAddressZipCode: "",
    agentNumberOrManual: "NUMBER",
    agentNumber: "",
    agentName: "",
    agentEmail: "",
    agentOfficeAddressLine1: "",
    agentOfficeAddressLine2: "",
    agentOfficeAddressCity: "",
    agentOfficeAddressState: "NJ",
    agentOfficeAddressZipCode: "",
    signer: "",
    additionalSigners: [],
    paymentType: undefined,
    annualReportNotification: false,
    corpWatchNotification: false,
    officialFormationDocument: true,
    certificateOfStanding: false,
    certifiedCopyOfFormationDocument: false,
  };
};

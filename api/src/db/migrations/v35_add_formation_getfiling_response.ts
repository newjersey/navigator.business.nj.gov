import { v34UserData } from "./v34_add_contact_to_formation_data";

export interface v35UserData {
  user: v35BusinessUser;
  profileData: v35ProfileData;
  formProgress: v35FormProgress;
  taskProgress: Record<string, v35TaskProgress>;
  licenseData: v35LicenseData | undefined;
  preferences: v35Preferences;
  taxFilingData: v35TaxFilingData;
  formationData: v35FormationData;
  version: number;
}

export const migrate_v34_to_v35 = (v34Data: v34UserData): v35UserData => {
  return {
    ...v34Data,
    formationData: {
      ...v34Data.formationData,
      formationResponse: v34Data.formationData.formationResponse
        ? {
            ...v34Data.formationData.formationResponse,
            formationId: undefined,
          }
        : undefined,
      getFilingResponse: undefined,
    },
    version: 35,
  };
};

// ---------------- v35 types ----------------

type v35TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v35FormProgress = "UNSTARTED" | "COMPLETED";

type v35BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v35ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v35ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v35Municipality | undefined;
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

type v35Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v35TaxFilingData = {
  entityIdStatus: v35EntityIdStatus;
  filings: v35TaxFiling[];
};

type v35EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

type v35TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v35NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v35LicenseData = {
  nameAndAddress: v35NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v35LicenseStatus;
  items: v35LicenseStatusItem[];
};

type v35Preferences = {
  roadmapOpenSections: v35SectionType[];
  roadmapOpenSteps: number[];
};

type v35LicenseStatusItem = {
  title: string;
  status: v35CheckoffStatus;
};

type v35CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v35LicenseStatus =
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

type v35SectionType = "PLAN" | "START" | "OPERATE";

type v35ExternalStatus = {
  newsletter?: v35NewsletterResponse;
  userTesting?: v35UserTestingResponse;
};

interface v35NewsletterResponse {
  success?: boolean;
  status: v35NewsletterStatus;
}

interface v35UserTestingResponse {
  success?: boolean;
  status: v35UserTestingStatus;
}

type v35NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v35UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v35FormationData {
  formationFormData: v35FormationFormData;
  formationResponse: v35FormationSubmitResponse | undefined;
  getFilingResponse: v35GetFilingResponse | undefined;
}

interface v35FormationFormData {
  businessSuffix: v35BusinessSuffix | undefined;
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
  paymentType: v35PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v35PaymentType = "CC" | "ACH" | undefined;

type v35BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v35FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v35FormationSubmitError[];
};

type v35FormationSubmitError = {
  field: string;
  message: string;
};

type v35GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v35 factories ----------------

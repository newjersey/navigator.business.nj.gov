import { v35UserData } from "./v35_add_formation_getfiling_response";

export interface v36UserData {
  user: v36BusinessUser;
  profileData: v36ProfileData;
  formProgress: v36FormProgress;
  taskProgress: Record<string, v36TaskProgress>;
  licenseData: v36LicenseData | undefined;
  preferences: v36Preferences;
  taxFilingData: v36TaxFilingData;
  formationData: v36FormationData;
  version: number;
}

export const migrate_v35_to_v36 = (v35Data: v35UserData): v36UserData => {
  return {
    ...v35Data,
    formationData: {
      ...v35Data.formationData,
      formationFormData: {
        ...v35Data.formationData.formationFormData,
        members: [],
      },
    },
    version: 36,
  };
};

// ---------------- v36 types ----------------

type v36TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v36FormProgress = "UNSTARTED" | "COMPLETED";

type v36BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v36ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v36ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v36Municipality | undefined;
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

type v36Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v36TaxFilingData = {
  entityIdStatus: v36EntityIdStatus;
  filings: v36TaxFiling[];
};

type v36EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

type v36TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v36NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v36LicenseData = {
  nameAndAddress: v36NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v36LicenseStatus;
  items: v36LicenseStatusItem[];
};

type v36Preferences = {
  roadmapOpenSections: v36SectionType[];
  roadmapOpenSteps: number[];
};

type v36LicenseStatusItem = {
  title: string;
  status: v36CheckoffStatus;
};

type v36CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v36LicenseStatus =
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

type v36SectionType = "PLAN" | "START" | "OPERATE";

type v36ExternalStatus = {
  newsletter?: v36NewsletterResponse;
  userTesting?: v36UserTestingResponse;
};

interface v36NewsletterResponse {
  success?: boolean;
  status: v36NewsletterStatus;
}

interface v36UserTestingResponse {
  success?: boolean;
  status: v36UserTestingStatus;
}

type v36NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v36UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v36FormationData {
  formationFormData: v36FormationFormData;
  formationResponse: v36FormationSubmitResponse | undefined;
  getFilingResponse: v36GetFilingResponse | undefined;
}

interface v36FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v36FormationFormData {
  businessSuffix: v36BusinessSuffix | undefined;
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
  members: v36FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v36PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v36PaymentType = "CC" | "ACH" | undefined;

type v36BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v36FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v36FormationSubmitError[];
};

type v36FormationSubmitError = {
  field: string;
  message: string;
};

type v36GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v36 factories ----------------

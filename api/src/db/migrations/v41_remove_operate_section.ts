import { v40UserData } from "./v40_merge_down_steps";

export interface v41UserData {
  user: v41BusinessUser;
  profileData: v41ProfileData;
  formProgress: v41FormProgress;
  taskProgress: Record<string, v41TaskProgress>;
  licenseData: v41LicenseData | undefined;
  preferences: v41Preferences;
  taxFilingData: v41TaxFilingData;
  formationData: v41FormationData;
  version: number;
}

export const migrate_v40_to_v41 = (v40Data: v40UserData): v41UserData => {
  return {
    ...v40Data,
    preferences: {
      ...v40Data.preferences,
      roadmapOpenSections: v40Data.preferences.roadmapOpenSections.filter(
        (it) => it !== "OPERATE"
      ) as v41SectionType[],
    },
    taxFilingData: {
      filings: v40Data.taxFilingData.filings,
    },
    version: 41,
  };
};

// ---------------- v41 types ----------------

type v41TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v41FormProgress = "UNSTARTED" | "COMPLETED";

type v41BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v41ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v41ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v41Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
}

type v41Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v41TaxFilingData = {
  filings: v41TaxFiling[];
};

type v41TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v41NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v41LicenseData = {
  nameAndAddress: v41NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v41LicenseStatus;
  items: v41LicenseStatusItem[];
};

type v41Preferences = {
  roadmapOpenSections: v41SectionType[];
  roadmapOpenSteps: number[];
};

type v41LicenseStatusItem = {
  title: string;
  status: v41CheckoffStatus;
};

type v41CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v41LicenseStatus =
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

type v41SectionType = "PLAN" | "START";

type v41ExternalStatus = {
  newsletter?: v41NewsletterResponse;
  userTesting?: v41UserTestingResponse;
};

interface v41NewsletterResponse {
  success?: boolean;
  status: v41NewsletterStatus;
}

interface v41UserTestingResponse {
  success?: boolean;
  status: v41UserTestingStatus;
}

type v41NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v41UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v41FormationData {
  formationFormData: v41FormationFormData;
  formationResponse: v41FormationSubmitResponse | undefined;
  getFilingResponse: v41GetFilingResponse | undefined;
}

interface v41FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v41FormationFormData {
  businessSuffix: v41BusinessSuffix | undefined;
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
  members: v41FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v41PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v41PaymentType = "CC" | "ACH" | undefined;

type v41BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v41FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v41FormationSubmitError[];
};

type v41FormationSubmitError = {
  field: string;
  message: string;
};

type v41GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v41 factories ----------------

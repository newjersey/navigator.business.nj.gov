import { v43UserData } from "./v43_add_initial_flow_to_profile_data";

export interface v44UserData {
  user: v44BusinessUser;
  profileData: v44ProfileData;
  formProgress: v44FormProgress;
  taskProgress: Record<string, v44TaskProgress>;
  licenseData: v44LicenseData | undefined;
  preferences: v44Preferences;
  taxFilingData: v44TaxFilingData;
  formationData: v44FormationData;
  version: number;
}

export const migrate_v43_to_v44 = (v43Data: v43UserData): v44UserData => {
  return {
    ...v43Data,
    profileData: {
      ...v43Data.profileData,
      cannabisLicenseType: undefined,
    },
    version: 44,
  };
};

// ---------------- v44 types ----------------

type v44TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v44FormProgress = "UNSTARTED" | "COMPLETED";

type v44BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v44ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v44ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v44Municipality | undefined;
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

type v44Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v44TaxFilingData = {
  filings: v44TaxFiling[];
};

type v44TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v44NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v44LicenseData = {
  nameAndAddress: v44NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v44LicenseStatus;
  items: v44LicenseStatusItem[];
};

type v44Preferences = {
  roadmapOpenSections: v44SectionType[];
  roadmapOpenSteps: number[];
};

type v44LicenseStatusItem = {
  title: string;
  status: v44CheckoffStatus;
};

type v44CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v44LicenseStatus =
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

type v44SectionType = "PLAN" | "START";

type v44ExternalStatus = {
  newsletter?: v44NewsletterResponse;
  userTesting?: v44UserTestingResponse;
};

interface v44NewsletterResponse {
  success?: boolean;
  status: v44NewsletterStatus;
}

interface v44UserTestingResponse {
  success?: boolean;
  status: v44UserTestingStatus;
}

type v44NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v44UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v44FormationData {
  formationFormData: v44FormationFormData;
  formationResponse: v44FormationSubmitResponse | undefined;
  getFilingResponse: v44GetFilingResponse | undefined;
}

interface v44FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v44FormationFormData {
  businessSuffix: v44BusinessSuffix | undefined;
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
  members: v44FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v44PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v44PaymentType = "CC" | "ACH" | undefined;

type v44BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v44FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v44FormationSubmitError[];
};

type v44FormationSubmitError = {
  field: string;
  message: string;
};

type v44GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v44 factories ----------------

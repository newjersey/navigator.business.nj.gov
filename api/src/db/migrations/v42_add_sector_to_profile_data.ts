import { randomInt } from "@shared/intHelpers";
import { v41UserData } from "./v41_remove_operate_section";

export interface v42UserData {
  user: v42BusinessUser;
  profileData: v42ProfileData;
  formProgress: v42FormProgress;
  taskProgress: Record<string, v42TaskProgress>;
  licenseData: v42LicenseData | undefined;
  preferences: v42Preferences;
  taxFilingData: v42TaxFilingData;
  formationData: v42FormationData;
  version: number;
}

export const migrate_v41_to_v42 = (v41Data: v41UserData): v42UserData => {
  return {
    ...v41Data,
    profileData: {
      ...v41Data.profileData,
      sectorId: undefined,
    },
    version: 42,
  };
};

// ---------------- v42 types ----------------

type v42TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v42FormProgress = "UNSTARTED" | "COMPLETED";

type v42BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v42ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

export interface v42ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v42Municipality | undefined;
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
  sectorId: string | undefined;
}

type v42Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v42TaxFilingData = {
  filings: v42TaxFiling[];
};

type v42TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v42NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v42LicenseData = {
  nameAndAddress: v42NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v42LicenseStatus;
  items: v42LicenseStatusItem[];
};

type v42Preferences = {
  roadmapOpenSections: v42SectionType[];
  roadmapOpenSteps: number[];
};

type v42LicenseStatusItem = {
  title: string;
  status: v42CheckoffStatus;
};

type v42CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v42LicenseStatus =
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

type v42SectionType = "PLAN" | "START";

type v42ExternalStatus = {
  newsletter?: v42NewsletterResponse;
  userTesting?: v42UserTestingResponse;
};

interface v42NewsletterResponse {
  success?: boolean;
  status: v42NewsletterStatus;
}

interface v42UserTestingResponse {
  success?: boolean;
  status: v42UserTestingStatus;
}

type v42NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v42UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v42FormationData {
  formationFormData: v42FormationFormData;
  formationResponse: v42FormationSubmitResponse | undefined;
  getFilingResponse: v42GetFilingResponse | undefined;
}

interface v42FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v42FormationFormData {
  businessSuffix: v42BusinessSuffix | undefined;
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
  members: v42FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v42PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v42PaymentType = "CC" | "ACH" | undefined;

type v42BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v42FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v42FormationSubmitError[];
};

type v42FormationSubmitError = {
  field: string;
  message: string;
};

type v42GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v42 factories ----------------

export const generatev42User = (overrides: Partial<v42BusinessUser>): v42BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    receiveNewsletter: false,
    userTesting: false,
    externalStatus: {},
    ...overrides,
  };
};

export const generatev42ProfileData = (overrides: Partial<v42ProfileData>): v42ProfileData => {
  return {
    hasExistingBusiness: false,
    businessName: `some-business-name-${randomInt()}`,
    industryId: "restaurant",
    legalStructureId: "sole-proprietorship",
    municipality: {
      name: `some-name-${randomInt()}`,
      displayName: `some-display-name-${randomInt()}`,
      county: `some-county-${randomInt()}`,
      id: `some-id-${randomInt()}`,
    },
    liquorLicense: true,
    homeBasedBusiness: true,
    constructionRenovationPlan: undefined,
    dateOfFormation: undefined,
    entityId: undefined,
    employerId: undefined,
    taxId: undefined,
    notes: "",
    ownershipTypeIds: [],
    existingEmployees: undefined,
    taxPin: undefined,
    sectorId: undefined,
    ...overrides,
  };
};

export const generatev42FormationFormData = (
  overrides: Partial<v42FormationFormData>
): v42FormationFormData => {
  return {
    businessSuffix: undefined,
    businessStartDate: "",
    businessAddressLine1: "",
    businessAddressLine2: "",
    businessAddressState: "",
    businessAddressZipCode: "",
    agentNumberOrManual: "NUMBER",
    agentNumber: "",
    agentName: "",
    agentEmail: "",
    agentOfficeAddressLine1: "",
    agentOfficeAddressLine2: "",
    agentOfficeAddressCity: "",
    agentOfficeAddressState: "",
    agentOfficeAddressZipCode: "",
    members: [],
    signer: "",
    additionalSigners: [],
    paymentType: undefined,
    annualReportNotification: false,
    corpWatchNotification: false,
    officialFormationDocument: false,
    certificateOfStanding: false,
    certifiedCopyOfFormationDocument: false,
    contactFirstName: "",
    contactLastName: "",
    contactPhoneNumber: "",
    ...overrides,
  };
};

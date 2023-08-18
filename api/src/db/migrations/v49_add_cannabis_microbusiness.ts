import { randomInt } from "@shared/intHelpers";
import { v48UserData } from "./v48_add_ab_experience";

export interface v49UserData {
  user: v49BusinessUser;
  profileData: v49ProfileData;
  formProgress: v49FormProgress;
  taskProgress: Record<string, v49TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v49LicenseData | undefined;
  preferences: v49Preferences;
  taxFilingData: v49TaxFilingData;
  formationData: v49FormationData;
  version: number;
}

export const migrate_v48_to_v49 = (v48Data: v48UserData): v49UserData => {
  return {
    ...v48Data,
    profileData: {
      ...v48Data.profileData,
      cannabisMicrobusiness: undefined
    },
    version: 49
  };
};

// ---------------- v49 types ----------------

type v49TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v49FormProgress = "UNSTARTED" | "COMPLETED";
export type v49ABExperience = "ExperienceA" | "ExperienceB";

type v49BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v49ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v49ABExperience;
};

interface v49ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

export interface v49ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v49Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v49ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
}

type v49Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v49TaxFilingData = {
  filings: v49TaxFiling[];
};

type v49TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v49NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v49LicenseData = {
  nameAndAddress: v49NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v49LicenseStatus;
  items: v49LicenseStatusItem[];
};

type v49Preferences = {
  roadmapOpenSections: v49SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v49LicenseStatusItem = {
  title: string;
  status: v49CheckoffStatus;
};

type v49CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v49LicenseStatus =
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

type v49SectionType = "PLAN" | "START";

type v49ExternalStatus = {
  newsletter?: v49NewsletterResponse;
  userTesting?: v49UserTestingResponse;
};

interface v49NewsletterResponse {
  success?: boolean;
  status: v49NewsletterStatus;
}

interface v49UserTestingResponse {
  success?: boolean;
  status: v49UserTestingStatus;
}

type v49NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v49UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v49FormationData {
  formationFormData: v49FormationFormData;
  formationResponse: v49FormationSubmitResponse | undefined;
  getFilingResponse: v49GetFilingResponse | undefined;
}

interface v49FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v49FormationFormData {
  businessSuffix: v49BusinessSuffix | undefined;
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
  members: v49FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v49PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v49PaymentType = "CC" | "ACH" | undefined;

type v49BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v49FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v49FormationSubmitError[];
};

type v49FormationSubmitError = {
  field: string;
  message: string;
};

type v49GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v49 factories ----------------

export const generatev49User = (overrides: Partial<v49BusinessUser>): v49BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    receiveNewsletter: false,
    userTesting: false,
    externalStatus: {},
    abExperience: "ExperienceA",
    ...overrides
  };
};

export const generatev49ProfileData = (overrides: Partial<v49ProfileData>): v49ProfileData => {
  return {
    hasExistingBusiness: false,
    initialOnboardingFlow: undefined,
    businessName: `some-business-name-${randomInt()}`,
    industryId: "restaurant",
    legalStructureId: "sole-proprietorship",
    municipality: {
      name: `some-name-${randomInt()}`,
      displayName: `some-display-name-${randomInt()}`,
      county: `some-county-${randomInt()}`,
      id: `some-id-${randomInt()}`
    },
    liquorLicense: true,
    homeBasedBusiness: true,
    constructionRenovationPlan: undefined,
    cannabisLicenseType: undefined,
    cannabisMicrobusiness: undefined,
    dateOfFormation: undefined,
    entityId: undefined,
    employerId: undefined,
    taxId: undefined,
    notes: "",
    ownershipTypeIds: [],
    existingEmployees: undefined,
    taxPin: undefined,
    sectorId: undefined,
    documents: {
      formationDoc: "",
      standingDoc: "",
      certifiedDoc: ""
    },
    ...overrides
  };
};

export const generatev49FormationFormData = (
  overrides: Partial<v49FormationFormData>
): v49FormationFormData => {
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
    ...overrides
  };
};

import { v54UserData } from "@db/migrations/v54_add_business_purpose";
import { randomInt } from "@shared/intHelpers";

export interface v55UserData {
  user: v55BusinessUser;
  profileData: v55ProfileData;
  formProgress: v55FormProgress;
  taskProgress: Record<string, v55TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v55LicenseData | undefined;
  preferences: v55Preferences;
  taxFilingData: v55TaxFilingData;
  formationData: v55FormationData;
  version: number;
}

export const migrate_v54_to_v55 = (v54Data: v54UserData): v55UserData => {
  const newIndustryId =
    v54Data.profileData.industryId === "pr-consultant" ||
    v54Data.profileData.industryId === "marketing-consulting"
      ? "marketing-pr-consulting"
      : v54Data.profileData.industryId;
  return {
    ...v54Data,
    profileData: {
      ...v54Data.profileData,
      industryId: newIndustryId,
    },
    version: 55,
  };
};

// ---------------- v55 types ----------------

type v55TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v55FormProgress = "UNSTARTED" | "COMPLETED";
export type v55ABExperience = "ExperienceA" | "ExperienceB";

type v55BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v55ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v55ABExperience;
};

interface v55ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

export interface v55ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v55Municipality | undefined;
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v55ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
}

type v55Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v55TaxFilingData = {
  filings: v55TaxFiling[];
};

type v55TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v55NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v55LicenseData = {
  nameAndAddress: v55NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v55LicenseStatus;
  items: v55LicenseStatusItem[];
};

type v55Preferences = {
  roadmapOpenSections: v55SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v55LicenseStatusItem = {
  title: string;
  status: v55CheckoffStatus;
};

type v55CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v55LicenseStatus =
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

type v55SectionType = "PLAN" | "START";

type v55ExternalStatus = {
  newsletter?: v55NewsletterResponse;
  userTesting?: v55UserTestingResponse;
};

interface v55NewsletterResponse {
  success?: boolean;
  status: v55NewsletterStatus;
}

interface v55UserTestingResponse {
  success?: boolean;
  status: v55UserTestingStatus;
}

type v55NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v55UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v55FormationData {
  formationFormData: v55FormationFormData;
  formationResponse: v55FormationSubmitResponse | undefined;
  getFilingResponse: v55GetFilingResponse | undefined;
}

interface v55FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v55FormationFormData {
  businessSuffix: v55BusinessSuffix | undefined;
  businessStartDate: string;
  businessAddressLine1: string;
  businessAddressLine2: string;
  businessAddressState: string;
  businessAddressZipCode: string;
  businessPurpose: string;
  agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  agentNumber: string;
  agentName: string;
  agentEmail: string;
  agentOfficeAddressLine1: string;
  agentOfficeAddressLine2: string;
  agentOfficeAddressCity: string;
  agentOfficeAddressState: string;
  agentOfficeAddressZipCode: string;
  members: v55FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v55PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v55PaymentType = "CC" | "ACH" | undefined;

type v55BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v55FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v55FormationSubmitError[];
};

type v55FormationSubmitError = {
  field: string;
  message: string;
};

type v55GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v55 factories ----------------
export const generatev55User = (overrides: Partial<v55BusinessUser>): v55BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    receiveNewsletter: false,
    userTesting: false,
    externalStatus: {},
    abExperience: "ExperienceA",
    ...overrides,
  };
};

export const generatev55ProfileData = (overrides: Partial<v55ProfileData>): v55ProfileData => {
  return {
    hasExistingBusiness: false,
    initialOnboardingFlow: "STARTING",
    cannabisLicenseType: undefined,
    cannabisMicrobusiness: undefined,
    documents: { formationDoc: "", standingDoc: "", certifiedDoc: "" },
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
    requiresCpa: false,
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
    naicsCode: "",
    ...overrides,
  };
};

export const generatev55FormationFormData = (
  overrides: Partial<v55FormationFormData>
): v55FormationFormData => {
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
    businessPurpose: "",
    ...overrides,
  };
};

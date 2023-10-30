import { v53UserData } from "@db/migrations/v53_migrate_cannabis_dvob";
import { randomInt } from "@shared/intHelpers";

export interface v54UserData {
  user: v54BusinessUser;
  profileData: v54ProfileData;
  formProgress: v54FormProgress;
  taskProgress: Record<string, v54TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v54LicenseData | undefined;
  preferences: v54Preferences;
  taxFilingData: v54TaxFilingData;
  formationData: v54FormationData;
  version: number;
}

export const migrate_v53_to_v54 = (v53Data: v53UserData): v54UserData => {
  return {
    ...v53Data,
    formationData: {
      ...v53Data.formationData,
      formationFormData: {
        ...v53Data.formationData.formationFormData,
        businessPurpose: "",
      },
    },
    version: 54,
  };
};

// ---------------- v54 types ----------------

type v54TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v54FormProgress = "UNSTARTED" | "COMPLETED";
export type v54ABExperience = "ExperienceA" | "ExperienceB";

type v54BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v54ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v54ABExperience;
};

interface v54ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}
export interface v54ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v54Municipality | undefined;
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
  documents: v54ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
}

type v54Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v54TaxFilingData = {
  filings: v54TaxFiling[];
};

type v54TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v54NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v54LicenseData = {
  nameAndAddress: v54NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v54LicenseStatus;
  items: v54LicenseStatusItem[];
};

type v54Preferences = {
  roadmapOpenSections: v54SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v54LicenseStatusItem = {
  title: string;
  status: v54CheckoffStatus;
};

type v54CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v54LicenseStatus =
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

type v54SectionType = "PLAN" | "START";

type v54ExternalStatus = {
  newsletter?: v54NewsletterResponse;
  userTesting?: v54UserTestingResponse;
};

interface v54NewsletterResponse {
  success?: boolean;
  status: v54NewsletterStatus;
}

interface v54UserTestingResponse {
  success?: boolean;
  status: v54UserTestingStatus;
}

type v54NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v54UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v54FormationData {
  formationFormData: v54FormationFormData;
  formationResponse: v54FormationSubmitResponse | undefined;
  getFilingResponse: v54GetFilingResponse | undefined;
}

interface v54FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v54FormationFormData {
  businessSuffix: v54BusinessSuffix | undefined;
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
  members: v54FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v54PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v54PaymentType = "CC" | "ACH" | undefined;

type v54BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v54FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v54FormationSubmitError[];
};

type v54FormationSubmitError = {
  field: string;
  message: string;
};

type v54GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v54 factories ----------------
export const generatev54User = (overrides: Partial<v54BusinessUser>): v54BusinessUser => {
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

export const generatev54ProfileData = (overrides: Partial<v54ProfileData>): v54ProfileData => {
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

export const generatev54FormationFormData = (
  overrides: Partial<v54FormationFormData>
): v54FormationFormData => {
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

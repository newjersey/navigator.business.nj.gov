import { randomInt } from "@shared/intHelpers";
import { v49UserData } from "./v49_add_cannabis_microbusiness";

export interface v50UserData {
  user: v50BusinessUser;
  profileData: v50ProfileData;
  formProgress: v50FormProgress;
  taskProgress: Record<string, v50TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v50LicenseData | undefined;
  preferences: v50Preferences;
  taxFilingData: v50TaxFilingData;
  formationData: v50FormationData;
  version: number;
}

export const migrate_v49_to_v50 = (v49Data: v49UserData): v50UserData => {
  const isAnnualCannabis =
    v49Data.profileData.industryId === "cannabis" && v49Data.profileData.cannabisLicenseType === "ANNUAL";
  const cannabisTaskStatus = v49Data.taskProgress["conditional-permit-cannabis"];

  return isAnnualCannabis
    ? {
        ...v49Data,
        taskProgress: {
          ...v49Data.taskProgress,
          "annual-license-cannabis": cannabisTaskStatus,
          "conditional-permit-cannabis": "NOT_STARTED",
        },
        version: 50,
      }
    : {
        ...v49Data,
        version: 50,
      };
};

// ---------------- v50 types ----------------

type v50TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v50FormProgress = "UNSTARTED" | "COMPLETED";
export type v50ABExperience = "ExperienceA" | "ExperienceB";

type v50BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v50ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v50ABExperience;
};

interface v50ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

export interface v50ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v50Municipality | undefined;
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
  documents: v50ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
}

type v50Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v50TaxFilingData = {
  filings: v50TaxFiling[];
};

type v50TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v50NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v50LicenseData = {
  nameAndAddress: v50NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v50LicenseStatus;
  items: v50LicenseStatusItem[];
};

type v50Preferences = {
  roadmapOpenSections: v50SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v50LicenseStatusItem = {
  title: string;
  status: v50CheckoffStatus;
};

type v50CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v50LicenseStatus =
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

type v50SectionType = "PLAN" | "START";

type v50ExternalStatus = {
  newsletter?: v50NewsletterResponse;
  userTesting?: v50UserTestingResponse;
};

interface v50NewsletterResponse {
  success?: boolean;
  status: v50NewsletterStatus;
}

interface v50UserTestingResponse {
  success?: boolean;
  status: v50UserTestingStatus;
}

type v50NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v50UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v50FormationData {
  formationFormData: v50FormationFormData;
  formationResponse: v50FormationSubmitResponse | undefined;
  getFilingResponse: v50GetFilingResponse | undefined;
}

interface v50FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v50FormationFormData {
  businessSuffix: v50BusinessSuffix | undefined;
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
  members: v50FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v50PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v50PaymentType = "CC" | "ACH" | undefined;

type v50BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v50FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v50FormationSubmitError[];
};

type v50FormationSubmitError = {
  field: string;
  message: string;
};

type v50GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v50 factories ----------------
export const generatev50User = (overrides: Partial<v50BusinessUser>): v50BusinessUser => {
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

export const generatev50ProfileData = (overrides: Partial<v50ProfileData>): v50ProfileData => {
  return {
    hasExistingBusiness: false,
    initialOnboardingFlow: "STARTING",
    cannabisLicenseType: undefined,
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
    cannabisMicrobusiness: undefined,
    ...overrides,
  };
};

export const generatev50FormationFormData = (
  overrides: Partial<v50FormationFormData>,
): v50FormationFormData => {
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

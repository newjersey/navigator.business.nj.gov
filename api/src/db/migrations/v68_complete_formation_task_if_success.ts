import { randomInt } from "@shared/intHelpers";
import { v67UserData } from "./v67_add_graduation_card";

export interface v68UserData {
  user: v68BusinessUser;
  profileData: v68ProfileData;
  formProgress: v68FormProgress;
  taskProgress: Record<string, v68TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v68LicenseData | undefined;
  preferences: v68Preferences;
  taxFilingData: v68TaxFilingData;
  formationData: v68FormationData;
  version: number;
}

export const migrate_v67_to_v68 = (v67Data: v67UserData): v68UserData => {
  const taskProgress = v67Data.taskProgress;

  if (v67Data.formationData.getFilingResponse?.success === true) {
    taskProgress["form-business-entity"] = "COMPLETED";
  }

  return {
    ...v67Data,
    taskProgress,
    version: 68
  };
};

// ---------------- v68 types ----------------

export type v68TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v68FormProgress = "UNSTARTED" | "COMPLETED";
export type v68ABExperience = "ExperienceA" | "ExperienceB";

type v68BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v68ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v68ABExperience;
};

interface v68ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v68BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v68ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;

export interface v68ProfileData {
  businessPersona: v68BusinessPersona;
  initialOnboardingFlow: v68BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v68Municipality | undefined;
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
  documents: v68ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v68ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
}

type v68Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v68TaxFilingData = {
  filings: v68TaxFiling[];
};

type v68TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v68NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v68LicenseData = {
  nameAndAddress: v68NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v68LicenseStatus;
  items: v68LicenseStatusItem[];
};

type v68Preferences = {
  roadmapOpenSections: v68SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v68LicenseStatusItem = {
  title: string;
  status: v68CheckoffStatus;
};

type v68CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v68LicenseStatus =
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

type v68SectionType = "PLAN" | "START";

type v68ExternalStatus = {
  newsletter?: v68NewsletterResponse;
  userTesting?: v68UserTestingResponse;
};

interface v68NewsletterResponse {
  success?: boolean;
  status: v68NewsletterStatus;
}

interface v68UserTestingResponse {
  success?: boolean;
  status: v68UserTestingStatus;
}

type v68NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v68UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v68FormationData {
  formationFormData: v68FormationFormData;
  formationResponse: v68FormationSubmitResponse | undefined;
  getFilingResponse: v68GetFilingResponse | undefined;
}

interface v68FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v68BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v68Municipality | undefined;
  readonly businessAddressLine1: string;
  readonly businessAddressLine2: string;
  readonly businessAddressState: string;
  readonly businessAddressZipCode: string;
  readonly businessPurpose: string;
  readonly provisions: string[];
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressState: string;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v68FormationAddress[];
  readonly signers: v68FormationAddress[];
  readonly paymentType: v68PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v68FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v68PaymentType = "CC" | "ACH" | undefined;

const llcBusinessSuffix = [
  "LLC",
  "L.L.C.",
  "LTD LIABILITY CO",
  "LTD LIABILITY CO.",
  "LTD LIABILITY COMPANY",
  "LIMITED LIABILITY CO",
  "LIMITED LIABILITY CO.",
  "LIMITED LIABILITY COMPANY"
] as const;

const llpBusinessSuffix = [
  "Limited Liability Partnership",
  "LLP",
  "L.L.P.",
  "Registered Limited Liability Partnership",
  "RLLP",
  "R.L.L.P."
] as const;

export const corpBusinessSuffix = [
  "Corporation",
  "Incorporated",
  "Company",
  "LTD",
  "CO",
  "CO.",
  "CORP",
  "CORP.",
  "INC",
  "INC."
] as const;

const AllBusinessSuffixes = [...llcBusinessSuffix, ...llpBusinessSuffix, ...corpBusinessSuffix] as const;

type v68BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v68FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v68FormationSubmitError[];
};

type v68FormationSubmitError = {
  field: string;
  message: string;
};

type v68GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v68 factories ----------------

export const generatev68User = (overrides: Partial<v68BusinessUser>): v68BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    receiveNewsletter: false,
    userTesting: false,
    externalStatus: {},
    abExperience: "ExperienceA",
    myNJUserKey: undefined,
    intercomHash: undefined,
    ...overrides
  };
};

export const generatev68ProfileData = (overrides: Partial<v68ProfileData>): v68ProfileData => {
  return {
    businessPersona: "STARTING",
    initialOnboardingFlow: "STARTING",
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
    requiresCpa: false,
    homeBasedBusiness: true,
    cannabisLicenseType: undefined,
    cannabisMicrobusiness: undefined,
    constructionRenovationPlan: undefined,
    dateOfFormation: undefined,
    entityId: undefined,
    employerId: undefined,
    taxId: undefined,
    notes: "",
    documents: {
      formationDoc: `some-formation-doc-${randomInt()}`,
      standingDoc: `some-standing-doc-${randomInt()}`,
      certifiedDoc: `some-certified-doc-${randomInt()}`
    },
    ownershipTypeIds: [],
    existingEmployees: undefined,
    taxPin: undefined,
    sectorId: undefined,
    naicsCode: "",
    foreignBusinessType: undefined,
    foreignBusinessTypeIds: [],
    nexusLocationInNewJersey: undefined,
    nexusDbaName: undefined,
    ...overrides
  };
};

export const generatev68FormationFormData = (
  overrides: Partial<v68FormationFormData>
): v68FormationFormData => {
  return {
    businessName: "",
    businessSuffix: undefined,
    businessTotalStock: "",
    businessStartDate: "",
    businessAddressCity: undefined,
    businessAddressLine1: "",
    businessAddressLine2: "",
    businessAddressState: "",
    businessAddressZipCode: "",
    businessPurpose: "",
    provisions: [],
    agentNumberOrManual: "NUMBER",
    agentNumber: "",
    agentName: "",
    agentEmail: "",
    agentOfficeAddressLine1: "",
    agentOfficeAddressLine2: "",
    agentOfficeAddressCity: "",
    agentOfficeAddressState: "",
    agentOfficeAddressZipCode: "",
    agentUseAccountInfo: false,
    agentUseBusinessAddress: false,
    members: [],
    signers: [],
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

export const generatev68GetFilingResponse = (
  overrides: Partial<v68GetFilingResponse>
): v68GetFilingResponse => {
  return {
    success: true,
    entityId: "",
    transactionDate: "",
    confirmationNumber: "",
    formationDoc: "",
    standingDoc: "",
    certifiedDoc: "",
    ...overrides
  };
};

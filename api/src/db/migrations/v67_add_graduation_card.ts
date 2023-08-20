import { randomInt } from "@shared/intHelpers";
import { v66UserData } from "./v66_add_nexus_to_profile";

export interface v67UserData {
  user: v67BusinessUser;
  profileData: v67ProfileData;
  formProgress: v67FormProgress;
  taskProgress: Record<string, v67TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v67LicenseData | undefined;
  preferences: v67Preferences;
  taxFilingData: v67TaxFilingData;
  formationData: v67FormationData;
  version: number;
}

export const migrate_v66_to_v67 = (v66Data: v66UserData): v67UserData => {
  const graduationCard = v66Data.profileData.businessPersona === "FOREIGN" ? [] : ["graduation"];

  return {
    ...v66Data,
    preferences: {
      ...v66Data.preferences,
      visibleRoadmapSidebarCards: [...v66Data.preferences.visibleRoadmapSidebarCards, ...graduationCard],
    },

    version: 67,
  };
};

// ---------------- v67 types ----------------

export type v67TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v67FormProgress = "UNSTARTED" | "COMPLETED";
export type v67ABExperience = "ExperienceA" | "ExperienceB";

type v67BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v67ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v67ABExperience;
};

interface v67ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v67BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v67ForeignBusinessType = "REMOTE_SELLER" | undefined;

export interface v67ProfileData {
  businessPersona: v67BusinessPersona;
  initialOnboardingFlow: v67BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v67Municipality | undefined;
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
  documents: v67ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v67ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
}

type v67Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v67TaxFilingData = {
  filings: v67TaxFiling[];
};

type v67TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v67NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v67LicenseData = {
  nameAndAddress: v67NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v67LicenseStatus;
  items: v67LicenseStatusItem[];
};

type v67Preferences = {
  roadmapOpenSections: v67SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v67LicenseStatusItem = {
  title: string;
  status: v67CheckoffStatus;
};

type v67CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v67LicenseStatus =
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

type v67SectionType = "PLAN" | "START";

type v67ExternalStatus = {
  newsletter?: v67NewsletterResponse;
  userTesting?: v67UserTestingResponse;
};

interface v67NewsletterResponse {
  success?: boolean;
  status: v67NewsletterStatus;
}

interface v67UserTestingResponse {
  success?: boolean;
  status: v67UserTestingStatus;
}

type v67NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v67UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v67FormationData {
  formationFormData: v67FormationFormData;
  formationResponse: v67FormationSubmitResponse | undefined;
  getFilingResponse: v67GetFilingResponse | undefined;
}

interface v67FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v67BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v67Municipality | undefined;
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
  readonly members: v67FormationAddress[];
  readonly signers: v67FormationAddress[];
  readonly paymentType: v67PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v67FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v67PaymentType = "CC" | "ACH" | undefined;

const llcBusinessSuffix = [
  "LLC",
  "L.L.C.",
  "LTD LIABILITY CO",
  "LTD LIABILITY CO.",
  "LTD LIABILITY COMPANY",
  "LIMITED LIABILITY CO",
  "LIMITED LIABILITY CO.",
  "LIMITED LIABILITY COMPANY",
] as const;

const llpBusinessSuffix = [
  "Limited Liability Partnership",
  "LLP",
  "L.L.P.",
  "Registered Limited Liability Partnership",
  "RLLP",
  "R.L.L.P.",
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
  "INC.",
] as const;

const AllBusinessSuffixes = [...llcBusinessSuffix, ...llpBusinessSuffix, ...corpBusinessSuffix] as const;

type v67BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v67FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v67FormationSubmitError[];
};

type v67FormationSubmitError = {
  field: string;
  message: string;
};

export type v67GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v67 factories ----------------
export const generatev67User = (overrides: Partial<v67BusinessUser>): v67BusinessUser => {
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
    ...overrides,
  };
};

export const generatev67ProfileData = (overrides: Partial<v67ProfileData>): v67ProfileData => {
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
      id: `some-id-${randomInt()}`,
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
      certifiedDoc: `some-certified-doc-${randomInt()}`,
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
    ...overrides,
  };
};

export const generatev67FormationFormData = (
  overrides: Partial<v67FormationFormData>
): v67FormationFormData => {
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
    ...overrides,
  };
};

export const generatev67GetFilingResponse = (
  overrides: Partial<v67GetFilingResponse>
): v67GetFilingResponse => {
  return {
    success: true,
    entityId: "",
    transactionDate: "",
    confirmationNumber: "",
    formationDoc: "",
    standingDoc: "",
    certifiedDoc: "",
    ...overrides,
  };
};

import { randomInt } from "@shared/intHelpers";
import { v71UserData } from "./v71_add_certified_interior_designer";

export interface v72UserData {
  user: v72BusinessUser;
  profileData: v72ProfileData;
  formProgress: v72FormProgress;
  taskProgress: Record<string, v72TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v72LicenseData | undefined;
  preferences: v72Preferences;
  taxFilingData: v72TaxFilingData;
  formationData: v72FormationData;
  version: number;
}

export const migrate_v71_to_v72 = (v71Data: v71UserData): v72UserData => {
  const taskProgress = v71Data.taskProgress;

  return {
    ...v71Data,
    profileData: {
      ...v71Data.profileData,
      realEstateAppraisalManagement: false
    },
    taskProgress,
    version: 72
  };
};

// ---------------- v72 types ----------------

export type v72TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v72FormProgress = "UNSTARTED" | "COMPLETED";
export type v72ABExperience = "ExperienceA" | "ExperienceB";

type v72BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v72ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v72ABExperience;
};

interface v72ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v72BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v72ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;

export interface v72ProfileData {
  businessPersona: v72BusinessPersona;
  initialOnboardingFlow: v72BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v72Municipality | undefined;
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
  documents: v72ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v72ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
}

type v72Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v72TaxFilingData = {
  filings: v72TaxFiling[];
};

type v72TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v72NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v72LicenseData = {
  nameAndAddress: v72NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v72LicenseStatus;
  items: v72LicenseStatusItem[];
};

type v72Preferences = {
  roadmapOpenSections: v72SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v72LicenseStatusItem = {
  title: string;
  status: v72CheckoffStatus;
};

type v72CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v72LicenseStatus =
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

type v72SectionType = "PLAN" | "START";

type v72ExternalStatus = {
  newsletter?: v72NewsletterResponse;
  userTesting?: v72UserTestingResponse;
};

interface v72NewsletterResponse {
  success?: boolean;
  status: v72NewsletterStatus;
}

interface v72UserTestingResponse {
  success?: boolean;
  status: v72UserTestingStatus;
}

type v72NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v72UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v72FormationData {
  formationFormData: v72FormationFormData;
  formationResponse: v72FormationSubmitResponse | undefined;
  getFilingResponse: v72GetFilingResponse | undefined;
}

interface v72FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v72BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v72Municipality | undefined;
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
  readonly members: v72FormationAddress[];
  readonly signers: v72FormationAddress[];
  readonly paymentType: v72PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v72FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v72PaymentType = "CC" | "ACH" | undefined;

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

type v72BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v72FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v72FormationSubmitError[];
};

type v72FormationSubmitError = {
  field: string;
  message: string;
};

type v72GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v72 factories ----------------
export const generatev72User = (overrides: Partial<v72BusinessUser>): v72BusinessUser => {
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

export const generatev72ProfileData = (overrides: Partial<v72ProfileData>): v72ProfileData => {
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
    realEstateAppraisalManagement: false,
    certifiedInteriorDesigner: false,
    providesStaffingService: false,
    ...overrides
  };
};

export const generatev72FormationFormData = (
  overrides: Partial<v72FormationFormData>
): v72FormationFormData => {
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

export const generatev72GetFilingResponse = (
  overrides: Partial<v72GetFilingResponse>
): v72GetFilingResponse => {
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

import { type MigrationClients } from "@db/migrations/types";
import { v76UserData } from "@db/migrations/v76_fix_trade_name_operating_phase_round_2";
import { randomInt } from "@shared/intHelpers";

export interface v77UserData {
  user: v77BusinessUser;
  profileData: v77ProfileData;
  formProgress: v77FormProgress;
  taskProgress: Record<string, v77TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v77LicenseData | undefined;
  preferences: v77Preferences;
  taxFilingData: v77TaxFilingData;
  formationData: v77FormationData;
  version: number;
}

export const migrate_v76_to_v77 = (
  v76Data: v76UserData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _?: MigrationClients,
): v77UserData => {
  const updatedCards = v76Data.preferences.visibleRoadmapSidebarCards.filter((cardId) => {
    return cardId !== "graduation";
  });

  return {
    ...v76Data,
    preferences: {
      ...v76Data.preferences,
      visibleRoadmapSidebarCards: updatedCards,
    },
    version: 77,
  };
};

// ---------------- v77 types ----------------

type v77TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v77FormProgress = "UNSTARTED" | "COMPLETED";
export type v77ABExperience = "ExperienceA" | "ExperienceB";

type v77BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v77ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v77ABExperience;
};

interface v77ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v77BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v77ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v77OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | undefined;

export interface v77ProfileData {
  businessPersona: v77BusinessPersona;
  initialOnboardingFlow: v77BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v77Municipality | undefined;
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
  documents: v77ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v77ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v77OperatingPhase;
}

type v77Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v77TaxFilingData = {
  filings: v77TaxFiling[];
};

type v77TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v77NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v77LicenseData = {
  nameAndAddress: v77NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v77LicenseStatus;
  items: v77LicenseStatusItem[];
};

type v77Preferences = {
  roadmapOpenSections: v77SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v77LicenseStatusItem = {
  title: string;
  status: v77CheckoffStatus;
};

type v77CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v77LicenseStatus =
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

type v77SectionType = "PLAN" | "START";

type v77ExternalStatus = {
  newsletter?: v77NewsletterResponse;
  userTesting?: v77UserTestingResponse;
};

interface v77NewsletterResponse {
  success?: boolean;
  status: v77NewsletterStatus;
}

interface v77UserTestingResponse {
  success?: boolean;
  status: v77UserTestingStatus;
}

type v77NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v77UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v77FormationData {
  formationFormData: v77FormationFormData;
  formationResponse: v77FormationSubmitResponse | undefined;
  getFilingResponse: v77GetFilingResponse | undefined;
}

interface v77FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v77BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v77Municipality | undefined;
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
  readonly members: v77FormationAddress[];
  readonly signers: v77FormationAddress[];
  readonly paymentType: v77PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v77FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v77PaymentType = "CC" | "ACH" | undefined;

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

const AllBusinessSuffixes = [
  ...llcBusinessSuffix,
  ...llpBusinessSuffix,
  ...corpBusinessSuffix,
] as const;

type v77BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v77FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v77FormationSubmitError[];
};

type v77FormationSubmitError = {
  field: string;
  message: string;
};

type v77GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v77 factories ----------------
export const generatev77User = (overrides: Partial<v77BusinessUser>): v77BusinessUser => {
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

export const generatev77ProfileData = (overrides: Partial<v77ProfileData>): v77ProfileData => {
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
    realEstateAppraisalManagement: false,
    certifiedInteriorDesigner: false,
    providesStaffingService: false,
    operatingPhase: undefined,
    ...overrides,
  };
};

export const generatev77FormationFormData = (
  overrides: Partial<v77FormationFormData>,
): v77FormationFormData => {
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

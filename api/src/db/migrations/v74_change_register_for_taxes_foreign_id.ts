import { randomInt } from "@shared/intHelpers";
import { v73UserData } from "./v73_add_operating_status_field";

export interface v74UserData {
  user: v74BusinessUser;
  profileData: v74ProfileData;
  formProgress: v74FormProgress;
  taskProgress: Record<string, v74TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v74LicenseData | undefined;
  preferences: v74Preferences;
  taxFilingData: v74TaxFilingData;
  formationData: v74FormationData;
  version: number;
}

export const migrate_v73_to_v74 = (v73Data: v73UserData): v74UserData => {
  const taskProgress = v73Data.taskProgress;

  if (
    v73Data.profileData.businessPersona === "FOREIGN" &&
    v73Data.profileData.foreignBusinessType === "NEXUS"
  ) {
    taskProgress["register-for-taxes"] = taskProgress["register-for-taxes-foreign"];
    delete taskProgress["register-for-taxes-foreign"];
  }

  return {
    ...v73Data,
    taskProgress,
    version: 74,
  };
};

// ---------------- v74 types ----------------

export type v74TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v74FormProgress = "UNSTARTED" | "COMPLETED";
export type v74ABExperience = "ExperienceA" | "ExperienceB";

type v74BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v74ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v74ABExperience;
};

interface v74ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v74BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v74ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v74OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | undefined;

export interface v74ProfileData {
  businessPersona: v74BusinessPersona;
  initialOnboardingFlow: v74BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v74Municipality | undefined;
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
  documents: v74ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v74ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v74OperatingPhase;
}

type v74Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v74TaxFilingData = {
  filings: v74TaxFiling[];
};

type v74TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v74NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v74LicenseData = {
  nameAndAddress: v74NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v74LicenseStatus;
  items: v74LicenseStatusItem[];
};

type v74Preferences = {
  roadmapOpenSections: v74SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v74LicenseStatusItem = {
  title: string;
  status: v74CheckoffStatus;
};

type v74CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v74LicenseStatus =
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

type v74SectionType = "PLAN" | "START";

type v74ExternalStatus = {
  newsletter?: v74NewsletterResponse;
  userTesting?: v74UserTestingResponse;
};

interface v74NewsletterResponse {
  success?: boolean;
  status: v74NewsletterStatus;
}

interface v74UserTestingResponse {
  success?: boolean;
  status: v74UserTestingStatus;
}

type v74NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v74UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v74FormationData {
  formationFormData: v74FormationFormData;
  formationResponse: v74FormationSubmitResponse | undefined;
  getFilingResponse: v74GetFilingResponse | undefined;
}

interface v74FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v74BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v74Municipality | undefined;
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
  readonly members: v74FormationAddress[];
  readonly signers: v74FormationAddress[];
  readonly paymentType: v74PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v74FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v74PaymentType = "CC" | "ACH" | undefined;

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

type v74BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v74FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v74FormationSubmitError[];
};

type v74FormationSubmitError = {
  field: string;
  message: string;
};

type v74GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v74 factories ----------------
export const generatev74User = (overrides: Partial<v74BusinessUser>): v74BusinessUser => {
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

export const generatev74ProfileData = (overrides: Partial<v74ProfileData>): v74ProfileData => {
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

export const generatev74FormationFormData = (
  overrides: Partial<v74FormationFormData>
): v74FormationFormData => {
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

import { v72UserData } from "@db/migrations/v72_add_real_estate_management";
import { formationTaskId } from "@shared/domain-logic/taskIds";
import { randomInt } from "@shared/intHelpers";
import { LookupLegalStructureById } from "@shared/legalStructure";

export interface v73UserData {
  user: v73BusinessUser;
  profileData: v73ProfileData;
  formProgress: v73FormProgress;
  taskProgress: Record<string, v73TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v73LicenseData | undefined;
  preferences: v73Preferences;
  taxFilingData: v73TaxFilingData;
  formationData: v73FormationData;
  version: number;
}

export const migrate_v72_to_v73 = (v72Data: v72UserData): v73UserData => {
  const taskProgress = v72Data.taskProgress;
  const isPublicFiling = LookupLegalStructureById(v72Data.profileData.legalStructureId).requiresPublicFiling;

  let newOperatingPhase: v73OperatingPhase;
  if (!v72Data.user.myNJUserKey) {
    newOperatingPhase = "GUEST_MODE";
  } else if (
    v72Data.profileData.initialOnboardingFlow === "OWNING" ||
    v72Data.profileData.businessPersona === "OWNING"
  ) {
    newOperatingPhase = "UP_AND_RUNNING";
  } else if (v72Data.taskProgress["register-for-taxes"] === "COMPLETED") {
    newOperatingPhase = "FORMED_AND_REGISTERED";
  } else if (v72Data.taskProgress[formationTaskId] === "COMPLETED" || !isPublicFiling) {
    newOperatingPhase = "NEEDS_TO_REGISTER_FOR_TAXES";
  } else {
    newOperatingPhase = "NEEDS_TO_FORM";
  }

  return {
    ...v72Data,
    profileData: {
      ...v72Data.profileData,
      operatingPhase: newOperatingPhase,
    },
    taskProgress,
    version: 73,
  };
};

// ---------------- v73 types ----------------

export type v73TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v73FormProgress = "UNSTARTED" | "COMPLETED";
export type v73ABExperience = "ExperienceA" | "ExperienceB";

export type v73BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v73ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v73ABExperience;
};

interface v73ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v73BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v73ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v73OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | undefined;

export interface v73ProfileData {
  businessPersona: v73BusinessPersona;
  initialOnboardingFlow: v73BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v73Municipality | undefined;
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
  documents: v73ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v73ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v73OperatingPhase;
}

type v73Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v73TaxFilingData = {
  filings: v73TaxFiling[];
};

type v73TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v73NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v73LicenseData = {
  nameAndAddress: v73NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v73LicenseStatus;
  items: v73LicenseStatusItem[];
};

type v73Preferences = {
  roadmapOpenSections: v73SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v73LicenseStatusItem = {
  title: string;
  status: v73CheckoffStatus;
};

type v73CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v73LicenseStatus =
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

type v73SectionType = "PLAN" | "START";

type v73ExternalStatus = {
  newsletter?: v73NewsletterResponse;
  userTesting?: v73UserTestingResponse;
};

interface v73NewsletterResponse {
  success?: boolean;
  status: v73NewsletterStatus;
}

interface v73UserTestingResponse {
  success?: boolean;
  status: v73UserTestingStatus;
}

type v73NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v73UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v73FormationData {
  formationFormData: v73FormationFormData;
  formationResponse: v73FormationSubmitResponse | undefined;
  getFilingResponse: v73GetFilingResponse | undefined;
}

interface v73FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v73BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v73Municipality | undefined;
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
  readonly members: v73FormationAddress[];
  readonly signers: v73FormationAddress[];
  readonly paymentType: v73PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v73FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v73PaymentType = "CC" | "ACH" | undefined;

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

type v73BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v73FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v73FormationSubmitError[];
};

type v73FormationSubmitError = {
  field: string;
  message: string;
};

type v73GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v73 factories ----------------

export const generatev73User = (overrides: Partial<v73BusinessUser>): v73BusinessUser => {
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

export const generatev73ProfileData = (overrides: Partial<v73ProfileData>): v73ProfileData => {
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

export const generatev73FormationFormData = (
  overrides: Partial<v73FormationFormData>
): v73FormationFormData => {
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

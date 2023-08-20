import { randomInt } from "@shared/intHelpers";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { v75UserData } from "./v75_fix_trade_name_operating_phase";

export interface v76UserData {
  user: v76BusinessUser;
  profileData: v76ProfileData;
  formProgress: v76FormProgress;
  taskProgress: Record<string, v76TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v76LicenseData | undefined;
  preferences: v76Preferences;
  taxFilingData: v76TaxFilingData;
  formationData: v76FormationData;
  version: number;
}

export const migrate_v75_to_v76 = (v75Data: v75UserData): v76UserData => {
  const legalStructure = LookupLegalStructureById(v75Data.profileData.legalStructureId);
  const newOperatingPhase =
    legalStructure.hasTradeName && v75Data.profileData.operatingPhase === "NEEDS_TO_FORM"
      ? "NEEDS_TO_REGISTER_FOR_TAXES"
      : v75Data.profileData.operatingPhase;

  return {
    ...v75Data,
    profileData: {
      ...v75Data.profileData,
      operatingPhase: newOperatingPhase,
    },
    version: 76,
  };
};

// ---------------- v76 types ----------------

type v76TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v76FormProgress = "UNSTARTED" | "COMPLETED";
export type v76ABExperience = "ExperienceA" | "ExperienceB";

type v76BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v76ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v76ABExperience;
};

interface v76ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v76BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v76ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v76OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | undefined;

export interface v76ProfileData {
  businessPersona: v76BusinessPersona;
  initialOnboardingFlow: v76BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v76Municipality | undefined;
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
  documents: v76ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v76ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v76OperatingPhase;
}

type v76Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v76TaxFilingData = {
  filings: v76TaxFiling[];
};

type v76TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v76NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v76LicenseData = {
  nameAndAddress: v76NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v76LicenseStatus;
  items: v76LicenseStatusItem[];
};

export type v76Preferences = {
  roadmapOpenSections: v76SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v76LicenseStatusItem = {
  title: string;
  status: v76CheckoffStatus;
};

type v76CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v76LicenseStatus =
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

type v76SectionType = "PLAN" | "START";

type v76ExternalStatus = {
  newsletter?: v76NewsletterResponse;
  userTesting?: v76UserTestingResponse;
};

interface v76NewsletterResponse {
  success?: boolean;
  status: v76NewsletterStatus;
}

interface v76UserTestingResponse {
  success?: boolean;
  status: v76UserTestingStatus;
}

type v76NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v76UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v76FormationData {
  formationFormData: v76FormationFormData;
  formationResponse: v76FormationSubmitResponse | undefined;
  getFilingResponse: v76GetFilingResponse | undefined;
}

interface v76FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v76BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v76Municipality | undefined;
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
  readonly members: v76FormationAddress[];
  readonly signers: v76FormationAddress[];
  readonly paymentType: v76PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v76FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v76PaymentType = "CC" | "ACH" | undefined;

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

type v76BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v76FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v76FormationSubmitError[];
};

type v76FormationSubmitError = {
  field: string;
  message: string;
};

type v76GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v76 factories ----------------
export const generatev76User = (overrides: Partial<v76BusinessUser>): v76BusinessUser => {
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

export const generatev76ProfileData = (overrides: Partial<v76ProfileData>): v76ProfileData => {
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

export const generatev76FormationFormData = (
  overrides: Partial<v76FormationFormData>,
): v76FormationFormData => {
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

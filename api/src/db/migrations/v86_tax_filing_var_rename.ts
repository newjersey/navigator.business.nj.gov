import { randomInt } from "@shared/intHelpers";
import { v85UserData } from "./v85_add_tax_filing_state";

export interface v86UserData {
  user: v86BusinessUser;
  profileData: v86ProfileData;
  formProgress: v86FormProgress;
  taskProgress: Record<string, v86TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v86LicenseData | undefined;
  preferences: v86Preferences;
  taxFilingData: v86TaxFilingData;
  formationData: v86FormationData;
  version: number;
}

export const migrate_v85_to_v86 = (v85Data: v85UserData): v86UserData => {
  const { lastUpdated: lastUpdatedISO, ...taxFiling } = v85Data.taxFilingData;
  return {
    ...v85Data,
    taxFilingData: { lastUpdatedISO, ...taxFiling },
    version: 86,
  };
};

// ---------------- v86 types ----------------

type v86TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v86FormProgress = "UNSTARTED" | "COMPLETED";
export type v86ABExperience = "ExperienceA" | "ExperienceB";

type v86BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v86ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v86ABExperience;
};

interface v86ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v86BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v86ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v86OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

export interface v86ProfileData {
  businessPersona: v86BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v86Municipality | undefined;
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
  documents: v86ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v86ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v86OperatingPhase;
}

type v86Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v86TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

type v86TaxFilingData = {
  state?: v86TaxFilingState;
  lastUpdatedISO?: string;
  businessName?: string;
  filings: v86TaxFiling[];
};

type v86TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v86NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v86LicenseData = {
  nameAndAddress: v86NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v86LicenseStatus;
  items: v86LicenseStatusItem[];
};

type v86Preferences = {
  roadmapOpenSections: v86SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v86LicenseStatusItem = {
  title: string;
  status: v86CheckoffStatus;
};

type v86CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v86LicenseStatus =
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

type v86SectionType = "PLAN" | "START";

type v86ExternalStatus = {
  newsletter?: v86NewsletterResponse;
  userTesting?: v86UserTestingResponse;
};

interface v86NewsletterResponse {
  success?: boolean;
  status: v86NewsletterStatus;
}

interface v86UserTestingResponse {
  success?: boolean;
  status: v86UserTestingStatus;
}

type v86NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v86UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v86FormationData {
  formationFormData: v86FormationFormData;
  formationResponse: v86FormationSubmitResponse | undefined;
  getFilingResponse: v86GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v86FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v86BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v86Municipality | undefined;
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
  readonly members: v86FormationAddress[];
  readonly signers: v86FormationAddress[];
  readonly paymentType: v86PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v86FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v86PaymentType = "CC" | "ACH" | undefined;

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

type v86BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v86FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v86FormationSubmitError[];
};

type v86FormationSubmitError = {
  field: string;
  message: string;
};

type v86GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v86 factories ----------------
export const generatev86User = (overrides: Partial<v86BusinessUser>): v86BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    receiveNewsletter: false,
    userTesting: false,
    externalStatus: {},
    myNJUserKey: undefined,
    intercomHash: undefined,
    abExperience: "ExperienceA",
    ...overrides,
  };
};

export const generatev86ProfileData = (overrides: Partial<v86ProfileData>): v86ProfileData => {
  return {
    businessPersona: "STARTING",
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

export const generatev86FormationFormData = (
  overrides: Partial<v86FormationFormData>
): v86FormationFormData => {
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

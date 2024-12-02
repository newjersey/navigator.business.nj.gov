import { v94UserData } from "@db/migrations/v94_add_missing_formation_types";
import { randomInt } from "@shared/intHelpers";

export interface v95UserData {
  user: v95BusinessUser;
  profileData: v95ProfileData;
  formProgress: v95FormProgress;
  taskProgress: Record<string, v95TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v95LicenseData | undefined;
  preferences: v95Preferences;
  taxFilingData: v95TaxFilingData;
  formationData: v95FormationData;
  version: number;
}

export const migrate_v94_to_v95 = (v94Data: v94UserData): v95UserData => {
  return {
    ...v94Data,
    version: 95,
  };
};

// ---------------- v95 types ----------------

type v95TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v95FormProgress = "UNSTARTED" | "COMPLETED";
export type v95ABExperience = "ExperienceA" | "ExperienceB";

type v95BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v95ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v95ABExperience;
};

interface v95ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v95BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v95ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v95OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v95CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v95IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v95CarServiceType | undefined;
  interstateTransport: boolean;
  isChildcareForSixOrMore: boolean | undefined;
}

interface v95ProfileData extends v95IndustrySpecificData {
  businessPersona: v95BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v95Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v95ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v95ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  operatingPhase: v95OperatingPhase;
}

type v95Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v95TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v95TaxFilingErrorFields = "Business Name" | "Taxpayer ID";

type v95TaxFilingData = {
  state?: v95TaxFilingState;
  lastUpdatedISO?: string;
  errorField?: v95TaxFilingErrorFields;
  businessName?: string;
  registered: boolean;
  filings: v95TaxFiling[];
};

type v95TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v95NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v95LicenseData = {
  nameAndAddress: v95NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v95LicenseStatus;
  items: v95LicenseStatusItem[];
};

type v95Preferences = {
  roadmapOpenSections: v95SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v95LicenseStatusItem = {
  title: string;
  status: v95CheckoffStatus;
};

type v95CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v95LicenseStatus =
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

const v95SectionNames = ["PLAN", "START"] as const;
type v95SectionType = (typeof v95SectionNames)[number];

type v95ExternalStatus = {
  newsletter?: v95NewsletterResponse;
  userTesting?: v95UserTestingResponse;
};

interface v95NewsletterResponse {
  success?: boolean;
  status: v95NewsletterStatus;
}

interface v95UserTestingResponse {
  success?: boolean;
  status: v95UserTestingStatus;
}

type v95NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v95UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v95FormationData {
  formationFormData: v95FormationFormData;
  formationResponse: v95FormationSubmitResponse | undefined;
  getFilingResponse: v95GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

export interface v95FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v95BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v95Municipality | undefined;
  readonly businessAddressLine1: string;
  readonly businessAddressLine2: string;
  readonly businessAddressState: string;
  readonly businessAddressZipCode: string;
  readonly businessPurpose: string;
  readonly withdrawals: string;
  readonly combinedInvestment: string;
  readonly dissolution: string;
  readonly canCreateLimitedPartner: boolean | undefined;
  readonly createLimitedPartnerTerms: string;
  readonly canGetDistribution: boolean | undefined;
  readonly getDistributionTerms: string;
  readonly canMakeDistribution: boolean | undefined;
  readonly makeDistributionTerms: string;
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
  readonly members: v95FormationAddress[];
  readonly signers: v95FormationAddress[];
  readonly paymentType: v95PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}
export interface v95FormationAddress {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  signature: boolean;
}

type v95PaymentType = "CC" | "ACH" | undefined;

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

type v95BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v95FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v95FormationSubmitError[];
};

type v95FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v95GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v95 factories ----------------

export const generatev95User = (overrides: Partial<v95BusinessUser>): v95BusinessUser => {
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

export const createEmptyv95FormationFormData = (): v95FormationFormData => {
  return {
    businessName: "",
    businessSuffix: undefined,
    businessTotalStock: "",
    businessStartDate: "",
    businessAddressCity: undefined,
    businessAddressLine1: "",
    businessAddressLine2: "",
    businessAddressState: "NJ",
    businessAddressZipCode: "",
    businessPurpose: "",
    withdrawals: "",
    combinedInvestment: "",
    dissolution: "",
    canCreateLimitedPartner: undefined,
    createLimitedPartnerTerms: "",
    canGetDistribution: undefined,
    getDistributionTerms: "",
    canMakeDistribution: undefined,
    makeDistributionTerms: "",
    provisions: [],
    agentNumberOrManual: "NUMBER",
    agentNumber: "",
    agentName: "",
    agentEmail: "",
    agentOfficeAddressLine1: "",
    agentOfficeAddressLine2: "",
    agentOfficeAddressCity: "",
    agentOfficeAddressState: "NJ",
    agentOfficeAddressZipCode: "",
    agentUseAccountInfo: false,
    agentUseBusinessAddress: false,
    members: [],
    signers: [],
    paymentType: undefined,
    annualReportNotification: true,
    corpWatchNotification: true,
    officialFormationDocument: true,
    certificateOfStanding: false,
    certifiedCopyOfFormationDocument: false,
    contactFirstName: "",
    contactLastName: "",
    contactPhoneNumber: "",
  };
};

export const generatev95IndustrySpecificData = (
  overrides: Partial<v95IndustrySpecificData>
): v95IndustrySpecificData => {
  return {
    liquorLicense: false,
    requiresCpa: false,
    homeBasedBusiness: false,
    cannabisLicenseType: undefined,
    cannabisMicrobusiness: undefined,
    constructionRenovationPlan: undefined,
    providesStaffingService: false,
    certifiedInteriorDesigner: false,
    realEstateAppraisalManagement: false,
    carService: undefined,
    interstateTransport: false,
    isChildcareForSixOrMore: undefined,
    ...overrides,
  };
};

export const generatev95ProfileData = (overrides: Partial<v95ProfileData>): v95ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev95IndustrySpecificData({}),
    businessPersona: persona,
    businessName: `some-business-name-${randomInt()}`,
    industryId: "restaurant",
    legalStructureId: "limited-liability-partnership",
    municipality: {
      name: `some-name-${randomInt()}`,
      displayName: `some-display-name-${randomInt()}`,
      county: `some-county-${randomInt()}`,
      id: `some-id-${randomInt()}`,
    },
    dateOfFormation: undefined,
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt() % 2 ? randomInt(9).toString() : randomInt(12).toString(),
    notes: `some-notes-${randomInt()}`,
    ownershipTypeIds: [],
    documents: {
      certifiedDoc: `${id}/certifiedDoc-${randomInt()}.pdf`,
      formationDoc: `${id}/formationDoc-${randomInt()}.pdf`,
      standingDoc: `${id}/standingDoc-${randomInt()}.pdf`,
    },
    existingEmployees: randomInt(7).toString(),
    taxPin: randomInt(4).toString(),
    sectorId: undefined,
    naicsCode: randomInt(6).toString(),
    foreignBusinessType: undefined,
    foreignBusinessTypeIds: [],
    nexusDbaName: undefined,
    nexusLocationInNewJersey: undefined,
    operatingPhase: "NEEDS_TO_FORM",
    ...overrides,
  };
};

export const v95TaxFilingDataGenerator = (overrides: Partial<v95TaxFilingData>): v95TaxFilingData => {
  return {
    state: undefined,
    businessName: undefined,
    errorField: undefined,
    lastUpdatedISO: undefined,
    registered: false,
    filings: [],
    ...overrides,
  };
};

export const v95UserDataGenerator = (overrides: Partial<v95UserData>): v95UserData => {
  return {
    version: 95,
    user: generatev95User({}),
    profileData: generatev95ProfileData({}),
    formProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
      hiddenCertificationIds: [],
      hiddenFundingIds: [],
      visibleSidebarCards: ["welcome"],
      returnToLink: "",
      isCalendarFullView: true,
      isHideableRoadmapOpen: false,
    },
    taxFilingData: v95TaxFilingDataGenerator({}),
    formationData: {
      formationFormData: createEmptyv95FormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
    },
    ...overrides,
  };
};

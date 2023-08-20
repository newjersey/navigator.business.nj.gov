import { randomInt } from "@shared/intHelpers";
import { v91UserData } from "./v91_consolidate_section_type";

export interface v92UserData {
  user: v92BusinessUser;
  profileData: v92ProfileData;
  formProgress: v92FormProgress;
  taskProgress: Record<string, v92TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v92LicenseData | undefined;
  preferences: v92Preferences;
  taxFilingData: v92TaxFilingData;
  formationData: v92FormationData;
  version: number;
}

export const migrate_v91_to_v92 = (v91Data: v91UserData): v92UserData => {
  return {
    ...v91Data,
    version: 92,
  };
};

// ---------------- v92 types ----------------

type v92TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v92FormProgress = "UNSTARTED" | "COMPLETED";
export type v92ABExperience = "ExperienceA" | "ExperienceB";

type v92BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v92ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v92ABExperience;
};

interface v92ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v92BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v92ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v92OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v92CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v92IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v92CarServiceType | undefined;
  interstateTransport: boolean;
}

interface v92ProfileData extends v92IndustrySpecificData {
  businessPersona: v92BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v92Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v92ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v92ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  operatingPhase: v92OperatingPhase;
}

type v92Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v92TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

type v92TaxFilingData = {
  state?: v92TaxFilingState;
  lastUpdatedISO?: string;
  businessName?: string;
  registered: boolean;
  filings: v92TaxFiling[];
};

type v92TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v92NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v92LicenseData = {
  nameAndAddress: v92NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v92LicenseStatus;
  items: v92LicenseStatusItem[];
};

type v92Preferences = {
  roadmapOpenSections: v92SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v92LicenseStatusItem = {
  title: string;
  status: v92CheckoffStatus;
};

type v92CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v92LicenseStatus =
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

const v92SectionNames = ["PLAN", "START"] as const;
type v92SectionType = (typeof v92SectionNames)[number];

type v92ExternalStatus = {
  newsletter?: v92NewsletterResponse;
  userTesting?: v92UserTestingResponse;
};

interface v92NewsletterResponse {
  success?: boolean;
  status: v92NewsletterStatus;
}

interface v92UserTestingResponse {
  success?: boolean;
  status: v92UserTestingStatus;
}

type v92NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v92UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v92FormationData {
  formationFormData: v92FormationFormData;
  formationResponse: v92FormationSubmitResponse | undefined;
  getFilingResponse: v92GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v92FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v92BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v92Municipality | undefined;
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
  readonly members: v92FormationAddress[];
  readonly signers: v92FormationAddress[];
  readonly paymentType: v92PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v92FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v92PaymentType = "CC" | "ACH" | undefined;

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

type v92BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v92FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v92FormationSubmitError[];
};

type v92FormationSubmitError = {
  field: string;
  message: string;
};

type v92GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v92 factories ----------------

export const generatev92User = (overrides: Partial<v92BusinessUser>): v92BusinessUser => {
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

export const createEmptyv92FormationFormData = (): v92FormationFormData => {
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

export const generatev92IndustrySpecificData = (
  overrides: Partial<v92IndustrySpecificData>,
): v92IndustrySpecificData => {
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
    ...overrides,
  };
};

export const generatev92ProfileData = (overrides: Partial<v92ProfileData>): v92ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev92IndustrySpecificData({}),
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

export const v92UserDataGenerator = (overrides: Partial<v92ProfileData>): v92UserData => {
  return {
    version: 92,
    user: generatev92User({}),
    profileData: generatev92ProfileData(overrides),
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
    taxFilingData: {
      state: undefined,
      businessName: undefined,
      lastUpdatedISO: undefined,
      registered: false,
      filings: [],
    },
    formationData: {
      formationFormData: createEmptyv92FormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
    },
  };
};

import { randomInt } from "@shared/intHelpers";
import { v86UserData } from "./v86_tax_filing_var_rename";

export interface v87UserData {
  user: v87BusinessUser;
  profileData: v87ProfileData;
  formProgress: v87FormProgress;
  taskProgress: Record<string, v87TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v87LicenseData | undefined;
  preferences: v87Preferences;
  taxFilingData: v87TaxFilingData;
  formationData: v87FormationData;
  version: number;
}

export const migrate_v86_to_v87 = (v86Data: v86UserData): v87UserData => {
  let newIndustryID;
  let newCarServiceType: v87CarServiceType;
  if (v86Data.profileData.industryId === "car-service") {
    newCarServiceType = "STANDARD";
  } else if (v86Data.profileData.industryId === "transportation") {
    newIndustryID = "car-service";
    newCarServiceType = "HIGH_CAPACITY";
  }
  return {
    ...v86Data,
    profileData: {
      ...v86Data.profileData,
      carService: newCarServiceType,
      industryId: newIndustryID || v86Data.profileData.industryId,
    },
    version: 87,
  };
};

// ---------------- v87 types ----------------

type v87TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v87FormProgress = "UNSTARTED" | "COMPLETED";
export type v87ABExperience = "ExperienceA" | "ExperienceB";

type v87BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v87ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v87ABExperience;
};

interface v87ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v87BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v87ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v87OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;
type v87CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v87ProfileData {
  businessPersona: v87BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v87Municipality | undefined;
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
  documents: v87ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v87ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v87OperatingPhase;
  carService: v87CarServiceType | undefined;
}

type v87Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v87TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

type v87TaxFilingData = {
  state?: v87TaxFilingState;
  lastUpdatedISO?: string;
  businessName?: string;
  filings: v87TaxFiling[];
};

type v87TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v87NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v87LicenseData = {
  nameAndAddress: v87NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v87LicenseStatus;
  items: v87LicenseStatusItem[];
};

type v87Preferences = {
  roadmapOpenSections: v87SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v87LicenseStatusItem = {
  title: string;
  status: v87CheckoffStatus;
};

type v87CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v87LicenseStatus =
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

type v87SectionType = "PLAN" | "START";

type v87ExternalStatus = {
  newsletter?: v87NewsletterResponse;
  userTesting?: v87UserTestingResponse;
};

interface v87NewsletterResponse {
  success?: boolean;
  status: v87NewsletterStatus;
}

interface v87UserTestingResponse {
  success?: boolean;
  status: v87UserTestingStatus;
}

type v87NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v87UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v87FormationData {
  formationFormData: v87FormationFormData;
  formationResponse: v87FormationSubmitResponse | undefined;
  getFilingResponse: v87GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v87FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v87BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v87Municipality | undefined;
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
  readonly members: v87FormationAddress[];
  readonly signers: v87FormationAddress[];
  readonly paymentType: v87PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v87FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v87PaymentType = "CC" | "ACH" | undefined;

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

type v87BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v87FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v87FormationSubmitError[];
};

type v87FormationSubmitError = {
  field: string;
  message: string;
};

type v87GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v87 factories ----------------
export const generatev87User = (overrides: Partial<v87BusinessUser>): v87BusinessUser => {
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

export const generatev87ProfileData = (overrides: Partial<v87ProfileData>): v87ProfileData => {
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
    carService: undefined,
    ...overrides,
  };
};

export const generatev87FormationFormData = (
  overrides: Partial<v87FormationFormData>,
): v87FormationFormData => {
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

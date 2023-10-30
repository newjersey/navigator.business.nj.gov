import { v65UserData } from "@db/migrations/v65_add_task_progess_card";
import { randomInt } from "@shared/intHelpers";

export interface v66UserData {
  user: v66BusinessUser;
  profileData: v66ProfileData;
  formProgress: v66FormProgress;
  taskProgress: Record<string, v66TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v66LicenseData | undefined;
  preferences: v66Preferences;
  taxFilingData: v66TaxFilingData;
  formationData: v66FormationData;
  version: number;
}

export const migrate_v65_to_v66 = (v65Data: v65UserData): v66UserData => {
  return {
    ...v65Data,
    profileData: {
      ...v65Data.profileData,
      nexusLocationInNewJersey: undefined,
      nexusDbaName: undefined,
    },
    version: 66,
  };
};

// ---------------- v66 types ----------------

type v66TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v66FormProgress = "UNSTARTED" | "COMPLETED";
export type v66ABExperience = "ExperienceA" | "ExperienceB";

type v66BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v66ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v66ABExperience;
};

interface v66ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v66BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v66ForeignBusinessType = "REMOTE_SELLER" | undefined;

export interface v66ProfileData {
  businessPersona: v66BusinessPersona;
  initialOnboardingFlow: v66BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v66Municipality | undefined;
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
  documents: v66ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v66ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
}

type v66Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v66TaxFilingData = {
  filings: v66TaxFiling[];
};

type v66TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v66NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v66LicenseData = {
  nameAndAddress: v66NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v66LicenseStatus;
  items: v66LicenseStatusItem[];
};

type v66Preferences = {
  roadmapOpenSections: v66SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v66LicenseStatusItem = {
  title: string;
  status: v66CheckoffStatus;
};

type v66CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v66LicenseStatus =
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

type v66SectionType = "PLAN" | "START";

type v66ExternalStatus = {
  newsletter?: v66NewsletterResponse;
  userTesting?: v66UserTestingResponse;
};

interface v66NewsletterResponse {
  success?: boolean;
  status: v66NewsletterStatus;
}

interface v66UserTestingResponse {
  success?: boolean;
  status: v66UserTestingStatus;
}

type v66NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v66UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v66FormationData {
  formationFormData: v66FormationFormData;
  formationResponse: v66FormationSubmitResponse | undefined;
  getFilingResponse: v66GetFilingResponse | undefined;
}

interface v66FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v66BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v66Municipality | undefined;
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
  readonly members: v66FormationAddress[];
  readonly signers: v66FormationAddress[];
  readonly paymentType: v66PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v66FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v66PaymentType = "CC" | "ACH" | undefined;

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

type v66BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v66FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v66FormationSubmitError[];
};

type v66FormationSubmitError = {
  field: string;
  message: string;
};

type v66GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v66 factories ----------------
export const generatev66User = (overrides: Partial<v66BusinessUser>): v66BusinessUser => {
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

export const generatev66ProfileData = (overrides: Partial<v66ProfileData>): v66ProfileData => {
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

export const generatev66FormationFormData = (
  overrides: Partial<v66FormationFormData>
): v66FormationFormData => {
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

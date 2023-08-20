import { v82UserData } from "./v82_add_up_and_running_owning_operating_phase";

export interface v83UserData {
  user: v83BusinessUser;
  profileData: v83ProfileData;
  formProgress: v83FormProgress;
  taskProgress: Record<string, v83TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v83LicenseData | undefined;
  preferences: v83Preferences;
  taxFilingData: v83TaxFilingData;
  formationData: v83FormationData;
  version: number;
}

export const migrate_v82_to_v83 = (v82Data: v82UserData): v83UserData => {
  return {
    ...v82Data,
    preferences: {
      ...v82Data.preferences,
      isHideableRoadmapOpen: false,
    },
    version: 83,
  };
};

// ---------------- v83 types ----------------

type v83TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v83FormProgress = "UNSTARTED" | "COMPLETED";
export type v83ABExperience = "ExperienceA" | "ExperienceB";

type v83BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v83ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v83ABExperience;
};

interface v83ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v83BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v83ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v83OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

interface v83ProfileData {
  businessPersona: v83BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v83Municipality | undefined;
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
  documents: v83ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v83ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v83OperatingPhase;
}

type v83Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v83TaxFilingData = {
  filings: v83TaxFiling[];
};

type v83TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v83NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v83LicenseData = {
  nameAndAddress: v83NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v83LicenseStatus;
  items: v83LicenseStatusItem[];
};

type v83Preferences = {
  roadmapOpenSections: v83SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v83LicenseStatusItem = {
  title: string;
  status: v83CheckoffStatus;
};

type v83CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v83LicenseStatus =
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

type v83SectionType = "PLAN" | "START";

type v83ExternalStatus = {
  newsletter?: v83NewsletterResponse;
  userTesting?: v83UserTestingResponse;
};

interface v83NewsletterResponse {
  success?: boolean;
  status: v83NewsletterStatus;
}

interface v83UserTestingResponse {
  success?: boolean;
  status: v83UserTestingStatus;
}

type v83NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v83UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v83FormationData {
  formationFormData: v83FormationFormData;
  formationResponse: v83FormationSubmitResponse | undefined;
  getFilingResponse: v83GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v83FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v83BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v83Municipality | undefined;
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
  readonly members: v83FormationAddress[];
  readonly signers: v83FormationAddress[];
  readonly paymentType: v83PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v83FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v83PaymentType = "CC" | "ACH" | undefined;

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

type v83BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v83FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v83FormationSubmitError[];
};

type v83FormationSubmitError = {
  field: string;
  message: string;
};

type v83GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v83 factories ----------------

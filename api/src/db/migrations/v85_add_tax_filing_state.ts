import { v84UserData } from "@db/migrations/v84_fix_completed_filing";

export interface v85UserData {
  user: v85BusinessUser;
  profileData: v85ProfileData;
  formProgress: v85FormProgress;
  taskProgress: Record<string, v85TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v85LicenseData | undefined;
  preferences: v85Preferences;
  taxFilingData: v85TaxFilingData;
  formationData: v85FormationData;
  version: number;
}

export const migrate_v84_to_v85 = (v84Data: v84UserData): v85UserData => {
  return {
    ...v84Data,
    taxFilingData: {
      ...v84Data.taxFilingData,
      state: undefined,
      lastUpdated: undefined,
      businessName: undefined,
    },
    version: 85,
  };
};

// ---------------- v85 types ----------------

type v85TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v85FormProgress = "UNSTARTED" | "COMPLETED";
export type v85ABExperience = "ExperienceA" | "ExperienceB";

type v85BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v85ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v85ABExperience;
};

interface v85ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v85BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v85ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v85OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

interface v85ProfileData {
  businessPersona: v85BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v85Municipality | undefined;
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
  documents: v85ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v85ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v85OperatingPhase;
}

type v85Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v85TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

type v85TaxFilingData = {
  state?: v85TaxFilingState;
  lastUpdated?: string;
  businessName?: string;
  filings: v85TaxFiling[];
};

type v85TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v85NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v85LicenseData = {
  nameAndAddress: v85NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v85LicenseStatus;
  items: v85LicenseStatusItem[];
};

type v85Preferences = {
  roadmapOpenSections: v85SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v85LicenseStatusItem = {
  title: string;
  status: v85CheckoffStatus;
};

type v85CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v85LicenseStatus =
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

type v85SectionType = "PLAN" | "START";

type v85ExternalStatus = {
  newsletter?: v85NewsletterResponse;
  userTesting?: v85UserTestingResponse;
};

interface v85NewsletterResponse {
  success?: boolean;
  status: v85NewsletterStatus;
}

interface v85UserTestingResponse {
  success?: boolean;
  status: v85UserTestingStatus;
}

type v85NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v85UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v85FormationData {
  formationFormData: v85FormationFormData;
  formationResponse: v85FormationSubmitResponse | undefined;
  getFilingResponse: v85GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v85FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v85BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v85Municipality | undefined;
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
  readonly members: v85FormationAddress[];
  readonly signers: v85FormationAddress[];
  readonly paymentType: v85PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v85FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v85PaymentType = "CC" | "ACH" | undefined;

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

type v85BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v85FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v85FormationSubmitError[];
};

type v85FormationSubmitError = {
  field: string;
  message: string;
};

type v85GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v85 factories ----------------

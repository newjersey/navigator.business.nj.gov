import { v83UserData } from "./v83_add_hideable_roadmap_to_preferences";

export interface v84UserData {
  user: v84BusinessUser;
  profileData: v84ProfileData;
  formProgress: v84FormProgress;
  taskProgress: Record<string, v84TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v84LicenseData | undefined;
  preferences: v84Preferences;
  taxFilingData: v84TaxFilingData;
  formationData: v84FormationData;
  version: number;
}

export const migrate_v83_to_v84 = (v83Data: v83UserData): v84UserData => {
  return {
    ...v83Data,
    formationData: {
      ...v83Data.formationData,
      completedFilingPayment: v83Data.formationData.getFilingResponse?.success || false,
    },
    version: 84,
  };
};

// ---------------- v84 types ----------------

type v84TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v84FormProgress = "UNSTARTED" | "COMPLETED";
export type v84ABExperience = "ExperienceA" | "ExperienceB";

type v84BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v84ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v84ABExperience;
};

interface v84ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v84BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v84ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v84OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

interface v84ProfileData {
  businessPersona: v84BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v84Municipality | undefined;
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
  documents: v84ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v84ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v84OperatingPhase;
}

type v84Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v84TaxFilingData = {
  filings: v84TaxFiling[];
};

type v84TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v84NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v84LicenseData = {
  nameAndAddress: v84NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v84LicenseStatus;
  items: v84LicenseStatusItem[];
};

type v84Preferences = {
  roadmapOpenSections: v84SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v84LicenseStatusItem = {
  title: string;
  status: v84CheckoffStatus;
};

type v84CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v84LicenseStatus =
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

type v84SectionType = "PLAN" | "START";

type v84ExternalStatus = {
  newsletter?: v84NewsletterResponse;
  userTesting?: v84UserTestingResponse;
};

interface v84NewsletterResponse {
  success?: boolean;
  status: v84NewsletterStatus;
}

interface v84UserTestingResponse {
  success?: boolean;
  status: v84UserTestingStatus;
}

type v84NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v84UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v84FormationData {
  formationFormData: v84FormationFormData;
  formationResponse: v84FormationSubmitResponse | undefined;
  getFilingResponse: v84GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v84FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v84BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v84Municipality | undefined;
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
  readonly members: v84FormationAddress[];
  readonly signers: v84FormationAddress[];
  readonly paymentType: v84PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v84FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v84PaymentType = "CC" | "ACH" | undefined;

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

type v84BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v84FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v84FormationSubmitError[];
};

type v84FormationSubmitError = {
  field: string;
  message: string;
};

type v84GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v84 factories ----------------

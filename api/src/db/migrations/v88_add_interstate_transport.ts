import { v87UserData } from "@db/migrations/v87_add_car_service";

export interface v88UserData {
  user: v88BusinessUser;
  profileData: v88ProfileData;
  formProgress: v88FormProgress;
  taskProgress: Record<string, v88TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v88LicenseData | undefined;
  preferences: v88Preferences;
  taxFilingData: v88TaxFilingData;
  formationData: v88FormationData;
  version: number;
}

export const migrate_v87_to_v88 = (v87Data: v87UserData): v88UserData => {
  return {
    ...v87Data,
    profileData: {
      ...v87Data.profileData,
      interstateTransport: false,
    },
    version: 88,
  };
};

// ---------------- v88 types ----------------

type v88TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v88FormProgress = "UNSTARTED" | "COMPLETED";
export type v88ABExperience = "ExperienceA" | "ExperienceB";

type v88BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v88ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v88ABExperience;
};

interface v88ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v88BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v88ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v88OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;
type v88CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v88ProfileData {
  businessPersona: v88BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v88Municipality | undefined;
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
  documents: v88ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v88ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v88OperatingPhase;
  carService: v88CarServiceType | undefined;
  interstateTransport: boolean;
}

type v88Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v88TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

type v88TaxFilingData = {
  state?: v88TaxFilingState;
  lastUpdatedISO?: string;
  businessName?: string;
  filings: v88TaxFiling[];
};

type v88TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v88NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v88LicenseData = {
  nameAndAddress: v88NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v88LicenseStatus;
  items: v88LicenseStatusItem[];
};

type v88Preferences = {
  roadmapOpenSections: v88SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v88LicenseStatusItem = {
  title: string;
  status: v88CheckoffStatus;
};

type v88CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v88LicenseStatus =
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

type v88SectionType = "PLAN" | "START";

type v88ExternalStatus = {
  newsletter?: v88NewsletterResponse;
  userTesting?: v88UserTestingResponse;
};

interface v88NewsletterResponse {
  success?: boolean;
  status: v88NewsletterStatus;
}

interface v88UserTestingResponse {
  success?: boolean;
  status: v88UserTestingStatus;
}

type v88NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v88UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v88FormationData {
  formationFormData: v88FormationFormData;
  formationResponse: v88FormationSubmitResponse | undefined;
  getFilingResponse: v88GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v88FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v88BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v88Municipality | undefined;
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
  readonly members: v88FormationAddress[];
  readonly signers: v88FormationAddress[];
  readonly paymentType: v88PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v88FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v88PaymentType = "CC" | "ACH" | undefined;

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

type v88BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v88FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v88FormationSubmitError[];
};

type v88FormationSubmitError = {
  field: string;
  message: string;
};

type v88GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v88 factories ----------------

import { v90UserData } from "./v90_home_based_business_can_be_undefined";

export interface v91UserData {
  user: v91BusinessUser;
  profileData: v91ProfileData;
  formProgress: v91FormProgress;
  taskProgress: Record<string, v91TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v91LicenseData | undefined;
  preferences: v91Preferences;
  taxFilingData: v91TaxFilingData;
  formationData: v91FormationData;
  version: number;
}

export const migrate_v90_to_v91 = (v90Data: v90UserData): v91UserData => {
  return {
    ...v90Data,
    version: 91
  };
};

// ---------------- v91 types ----------------

type v91TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v91FormProgress = "UNSTARTED" | "COMPLETED";
export type v91ABExperience = "ExperienceA" | "ExperienceB";

type v91BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v91ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v91ABExperience;
};

interface v91ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v91BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v91ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v91OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;
type v91CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v91ProfileData {
  businessPersona: v91BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v91Municipality | undefined;
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v91ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v91ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v91OperatingPhase;
  carService: v91CarServiceType | undefined;
  interstateTransport: boolean;
}

type v91Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v91TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

type v91TaxFilingData = {
  state?: v91TaxFilingState;
  lastUpdatedISO?: string;
  businessName?: string;
  registered: boolean;
  filings: v91TaxFiling[];
};

type v91TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v91NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v91LicenseData = {
  nameAndAddress: v91NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v91LicenseStatus;
  items: v91LicenseStatusItem[];
};

type v91Preferences = {
  roadmapOpenSections: v91SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v91LicenseStatusItem = {
  title: string;
  status: v91CheckoffStatus;
};

type v91CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v91LicenseStatus =
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

const v91SectionNames = ["PLAN", "START"] as const;
type v91SectionType = (typeof v91SectionNames)[number];

type v91ExternalStatus = {
  newsletter?: v91NewsletterResponse;
  userTesting?: v91UserTestingResponse;
};

interface v91NewsletterResponse {
  success?: boolean;
  status: v91NewsletterStatus;
}

interface v91UserTestingResponse {
  success?: boolean;
  status: v91UserTestingStatus;
}

type v91NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v91UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v91FormationData {
  formationFormData: v91FormationFormData;
  formationResponse: v91FormationSubmitResponse | undefined;
  getFilingResponse: v91GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v91FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v91BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v91Municipality | undefined;
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
  readonly members: v91FormationAddress[];
  readonly signers: v91FormationAddress[];
  readonly paymentType: v91PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v91FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v91PaymentType = "CC" | "ACH" | undefined;

const llcBusinessSuffix = [
  "LLC",
  "L.L.C.",
  "LTD LIABILITY CO",
  "LTD LIABILITY CO.",
  "LTD LIABILITY COMPANY",
  "LIMITED LIABILITY CO",
  "LIMITED LIABILITY CO.",
  "LIMITED LIABILITY COMPANY"
] as const;

const llpBusinessSuffix = [
  "Limited Liability Partnership",
  "LLP",
  "L.L.P.",
  "Registered Limited Liability Partnership",
  "RLLP",
  "R.L.L.P."
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
  "INC."
] as const;

const AllBusinessSuffixes = [...llcBusinessSuffix, ...llpBusinessSuffix, ...corpBusinessSuffix] as const;

type v91BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v91FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v91FormationSubmitError[];
};

type v91FormationSubmitError = {
  field: string;
  message: string;
};

type v91GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v91 factories ----------------

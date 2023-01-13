import { v89UserData } from "./v89_tax_filing_registered_bool";

export interface v90UserData {
  user: v90BusinessUser;
  profileData: v90ProfileData;
  formProgress: v90FormProgress;
  taskProgress: Record<string, v90TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v90LicenseData | undefined;
  preferences: v90Preferences;
  taxFilingData: v90TaxFilingData;
  formationData: v90FormationData;
  version: number;
}

export const migrate_v89_to_v90 = (v89Data: v89UserData): v90UserData => {
  return {
    ...v89Data,
    version: 90,
  };
};

// ---------------- v90 types ----------------

type v90TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v90FormProgress = "UNSTARTED" | "COMPLETED";
export type v90ABExperience = "ExperienceA" | "ExperienceB";

type v90BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v90ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v90ABExperience;
};

interface v90ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v90BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v90ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v90OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;
type v90CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v90ProfileData {
  businessPersona: v90BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v90Municipality | undefined;
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
  documents: v90ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v90ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v90OperatingPhase;
  carService: v90CarServiceType | undefined;
  interstateTransport: boolean;
}

type v90Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v90TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

type v90TaxFilingData = {
  state?: v90TaxFilingState;
  lastUpdatedISO?: string;
  businessName?: string;
  registered: boolean;
  filings: v90TaxFiling[];
};

type v90TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v90NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v90LicenseData = {
  nameAndAddress: v90NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v90LicenseStatus;
  items: v90LicenseStatusItem[];
};

type v90Preferences = {
  roadmapOpenSections: v90SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v90LicenseStatusItem = {
  title: string;
  status: v90CheckoffStatus;
};

type v90CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v90LicenseStatus =
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

type v90SectionType = "PLAN" | "START";

type v90ExternalStatus = {
  newsletter?: v90NewsletterResponse;
  userTesting?: v90UserTestingResponse;
};

interface v90NewsletterResponse {
  success?: boolean;
  status: v90NewsletterStatus;
}

interface v90UserTestingResponse {
  success?: boolean;
  status: v90UserTestingStatus;
}

type v90NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v90UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v90FormationData {
  formationFormData: v90FormationFormData;
  formationResponse: v90FormationSubmitResponse | undefined;
  getFilingResponse: v90GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v90FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v90BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v90Municipality | undefined;
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
  readonly members: v90FormationAddress[];
  readonly signers: v90FormationAddress[];
  readonly paymentType: v90PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v90FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v90PaymentType = "CC" | "ACH" | undefined;

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

type v90BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v90FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v90FormationSubmitError[];
};

type v90FormationSubmitError = {
  field: string;
  message: string;
};

type v90GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v90 factories ----------------

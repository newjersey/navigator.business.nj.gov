import { v79UserData } from "./v79_add_return_to_link";

export interface v80UserData {
  user: v80BusinessUser;
  profileData: v80ProfileData;
  formProgress: v80FormProgress;
  taskProgress: Record<string, v80TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v80LicenseData | undefined;
  preferences: v80Preferences;
  taxFilingData: v80TaxFilingData;
  formationData: v80FormationData;
  version: number;
}

export const migrate_v79_to_v80 = (v79Data: v79UserData): v80UserData => {
  return {
    ...v79Data,
    preferences: {
      ...v79Data.preferences,
      isCalendarFullView: true,
    },
    version: 80,
  };
};

// ---------------- v80 types ----------------

type v80TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v80FormProgress = "UNSTARTED" | "COMPLETED";
export type v80ABExperience = "ExperienceA" | "ExperienceB";

type v80BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v80ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v80ABExperience;
};

interface v80ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v80BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v80ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v80OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | undefined;

interface v80ProfileData {
  businessPersona: v80BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v80Municipality | undefined;
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
  documents: v80ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v80ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v80OperatingPhase;
}

type v80Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v80TaxFilingData = {
  filings: v80TaxFiling[];
};

type v80TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v80NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v80LicenseData = {
  nameAndAddress: v80NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v80LicenseStatus;
  items: v80LicenseStatusItem[];
};

type v80Preferences = {
  roadmapOpenSections: v80SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
};

type v80LicenseStatusItem = {
  title: string;
  status: v80CheckoffStatus;
};

type v80CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v80LicenseStatus =
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

type v80SectionType = "PLAN" | "START";

type v80ExternalStatus = {
  newsletter?: v80NewsletterResponse;
  userTesting?: v80UserTestingResponse;
};

interface v80NewsletterResponse {
  success?: boolean;
  status: v80NewsletterStatus;
}

interface v80UserTestingResponse {
  success?: boolean;
  status: v80UserTestingStatus;
}

type v80NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v80UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v80FormationData {
  formationFormData: v80FormationFormData;
  formationResponse: v80FormationSubmitResponse | undefined;
  getFilingResponse: v80GetFilingResponse | undefined;
}

interface v80FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v80BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v80Municipality | undefined;
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
  readonly members: v80FormationAddress[];
  readonly signers: v80FormationAddress[];
  readonly paymentType: v80PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v80FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v80PaymentType = "CC" | "ACH" | undefined;

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

type v80BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v80FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v80FormationSubmitError[];
};

type v80FormationSubmitError = {
  field: string;
  message: string;
};

type v80GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v80 factories ----------------

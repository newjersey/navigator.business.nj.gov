import { v78UserData } from "./v78_remove_initial_business_persona";

export interface v79UserData {
  user: v79BusinessUser;
  profileData: v79ProfileData;
  formProgress: v79FormProgress;
  taskProgress: Record<string, v79TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v79LicenseData | undefined;
  preferences: v79Preferences;
  taxFilingData: v79TaxFilingData;
  formationData: v79FormationData;
  version: number;
}

export const migrate_v78_to_v79 = (v78Data: v78UserData): v79UserData => {
  return {
    ...v78Data,
    preferences: {
      ...v78Data.preferences,
      returnToLink: ""
    },
    version: 79
  };
};

// ---------------- v79 types ----------------

type v79TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v79FormProgress = "UNSTARTED" | "COMPLETED";
export type v79ABExperience = "ExperienceA" | "ExperienceB";

type v79BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v79ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v79ABExperience;
};

interface v79ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v79BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v79ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v79OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | undefined;

interface v79ProfileData {
  businessPersona: v79BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v79Municipality | undefined;
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
  documents: v79ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v79ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v79OperatingPhase;
}

type v79Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v79TaxFilingData = {
  filings: v79TaxFiling[];
};

type v79TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v79NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v79LicenseData = {
  nameAndAddress: v79NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v79LicenseStatus;
  items: v79LicenseStatusItem[];
};

type v79Preferences = {
  roadmapOpenSections: v79SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  returnToLink: string;
};

type v79LicenseStatusItem = {
  title: string;
  status: v79CheckoffStatus;
};

type v79CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v79LicenseStatus =
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

type v79SectionType = "PLAN" | "START";

type v79ExternalStatus = {
  newsletter?: v79NewsletterResponse;
  userTesting?: v79UserTestingResponse;
};

interface v79NewsletterResponse {
  success?: boolean;
  status: v79NewsletterStatus;
}

interface v79UserTestingResponse {
  success?: boolean;
  status: v79UserTestingStatus;
}

type v79NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v79UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v79FormationData {
  formationFormData: v79FormationFormData;
  formationResponse: v79FormationSubmitResponse | undefined;
  getFilingResponse: v79GetFilingResponse | undefined;
}

interface v79FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v79BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v79Municipality | undefined;
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
  readonly members: v79FormationAddress[];
  readonly signers: v79FormationAddress[];
  readonly paymentType: v79PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v79FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v79PaymentType = "CC" | "ACH" | undefined;

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

type v79BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v79FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v79FormationSubmitError[];
};

type v79FormationSubmitError = {
  field: string;
  message: string;
};

type v79GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v79 factories ----------------

import { v81UserData } from "./v81_add_completed_filing_payment";

export interface v82UserData {
  user: v82BusinessUser;
  profileData: v82ProfileData;
  formProgress: v82FormProgress;
  taskProgress: Record<string, v82TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v82LicenseData | undefined;
  preferences: v82Preferences;
  taxFilingData: v82TaxFilingData;
  formationData: v82FormationData;
  version: number;
}

export const migrate_v81_to_v82 = (v81Data: v81UserData): v82UserData => {
  const operatingPhase =
    v81Data.profileData.businessPersona === "OWNING" &&
    v81Data.profileData.operatingPhase === "UP_AND_RUNNING"
      ? "UP_AND_RUNNING_OWNING"
      : v81Data.profileData.operatingPhase;

  return {
    ...v81Data,
    profileData: {
      ...v81Data.profileData,
      operatingPhase: operatingPhase
    },
    version: 82
  };
};

// ---------------- v82 types ----------------

type v82TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v82FormProgress = "UNSTARTED" | "COMPLETED";
export type v82ABExperience = "ExperienceA" | "ExperienceB";

type v82BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v82ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v82ABExperience;
};

interface v82ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v82BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v82ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v82OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

interface v82ProfileData {
  businessPersona: v82BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v82Municipality | undefined;
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
  documents: v82ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v82ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v82OperatingPhase;
}

type v82Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v82TaxFilingData = {
  filings: v82TaxFiling[];
};

type v82TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v82NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v82LicenseData = {
  nameAndAddress: v82NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v82LicenseStatus;
  items: v82LicenseStatusItem[];
};

type v82Preferences = {
  roadmapOpenSections: v82SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
};

type v82LicenseStatusItem = {
  title: string;
  status: v82CheckoffStatus;
};

type v82CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v82LicenseStatus =
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

type v82SectionType = "PLAN" | "START";

type v82ExternalStatus = {
  newsletter?: v82NewsletterResponse;
  userTesting?: v82UserTestingResponse;
};

interface v82NewsletterResponse {
  success?: boolean;
  status: v82NewsletterStatus;
}

interface v82UserTestingResponse {
  success?: boolean;
  status: v82UserTestingStatus;
}

type v82NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v82UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v82FormationData {
  formationFormData: v82FormationFormData;
  formationResponse: v82FormationSubmitResponse | undefined;
  getFilingResponse: v82GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v82FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v82BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v82Municipality | undefined;
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
  readonly members: v82FormationAddress[];
  readonly signers: v82FormationAddress[];
  readonly paymentType: v82PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v82FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v82PaymentType = "CC" | "ACH" | undefined;

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

type v82BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v82FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v82FormationSubmitError[];
};

type v82FormationSubmitError = {
  field: string;
  message: string;
};

type v82GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v82 factories ----------------

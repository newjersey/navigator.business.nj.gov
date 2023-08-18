import { v70UserData } from "./v70_add_staffing_service";

export interface v71UserData {
  user: v71BusinessUser;
  profileData: v71ProfileData;
  formProgress: v71FormProgress;
  taskProgress: Record<string, v71TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v71LicenseData | undefined;
  preferences: v71Preferences;
  taxFilingData: v71TaxFilingData;
  formationData: v71FormationData;
  version: number;
}

export const migrate_v70_to_v71 = (v70Data: v70UserData): v71UserData => {
  const taskProgress = v70Data.taskProgress;

  return {
    ...v70Data,
    profileData: {
      ...v70Data.profileData,
      certifiedInteriorDesigner: false
    },
    taskProgress,
    version: 71
  };
};

// ---------------- v71 types ----------------

type v71TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v71FormProgress = "UNSTARTED" | "COMPLETED";
export type v71ABExperience = "ExperienceA" | "ExperienceB";

type v71BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v71ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v71ABExperience;
};

interface v71ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v71BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v71ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;

interface v71ProfileData {
  businessPersona: v71BusinessPersona;
  initialOnboardingFlow: v71BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v71Municipality | undefined;
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
  documents: v71ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v71ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
}

type v71Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v71TaxFilingData = {
  filings: v71TaxFiling[];
};

type v71TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v71NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v71LicenseData = {
  nameAndAddress: v71NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v71LicenseStatus;
  items: v71LicenseStatusItem[];
};

type v71Preferences = {
  roadmapOpenSections: v71SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v71LicenseStatusItem = {
  title: string;
  status: v71CheckoffStatus;
};

type v71CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v71LicenseStatus =
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

type v71SectionType = "PLAN" | "START";

type v71ExternalStatus = {
  newsletter?: v71NewsletterResponse;
  userTesting?: v71UserTestingResponse;
};

interface v71NewsletterResponse {
  success?: boolean;
  status: v71NewsletterStatus;
}

interface v71UserTestingResponse {
  success?: boolean;
  status: v71UserTestingStatus;
}

type v71NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v71UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v71FormationData {
  formationFormData: v71FormationFormData;
  formationResponse: v71FormationSubmitResponse | undefined;
  getFilingResponse: v71GetFilingResponse | undefined;
}

interface v71FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v71BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v71Municipality | undefined;
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
  readonly members: v71FormationAddress[];
  readonly signers: v71FormationAddress[];
  readonly paymentType: v71PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v71FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v71PaymentType = "CC" | "ACH" | undefined;

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

type v71BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v71FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v71FormationSubmitError[];
};

type v71FormationSubmitError = {
  field: string;
  message: string;
};

type v71GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v71 factories ----------------

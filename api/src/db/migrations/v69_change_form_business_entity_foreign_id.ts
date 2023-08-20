import { v68UserData } from "./v68_complete_formation_task_if_success";

export interface v69UserData {
  user: v69BusinessUser;
  profileData: v69ProfileData;
  formProgress: v69FormProgress;
  taskProgress: Record<string, v69TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v69LicenseData | undefined;
  preferences: v69Preferences;
  taxFilingData: v69TaxFilingData;
  formationData: v69FormationData;
  version: number;
}

export const migrate_v68_to_v69 = (v68Data: v68UserData): v69UserData => {
  const taskProgress = v68Data.taskProgress;

  if (
    v68Data.profileData.businessPersona === "FOREIGN" &&
    v68Data.profileData.foreignBusinessType === "NEXUS"
  ) {
    taskProgress["form-business-entity"] = taskProgress["form-business-entity-foreign"];
    delete taskProgress["form-business-entity-foreign"];
  }

  return {
    ...v68Data,
    taskProgress,
    version: 69,
  };
};

// ---------------- v69 types ----------------

type v69TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v69FormProgress = "UNSTARTED" | "COMPLETED";
export type v69ABExperience = "ExperienceA" | "ExperienceB";

type v69BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v69ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v69ABExperience;
};

interface v69ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v69BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v69ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;

interface v69ProfileData {
  businessPersona: v69BusinessPersona;
  initialOnboardingFlow: v69BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v69Municipality | undefined;
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
  documents: v69ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v69ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
}

type v69Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v69TaxFilingData = {
  filings: v69TaxFiling[];
};

type v69TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v69NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v69LicenseData = {
  nameAndAddress: v69NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v69LicenseStatus;
  items: v69LicenseStatusItem[];
};

type v69Preferences = {
  roadmapOpenSections: v69SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v69LicenseStatusItem = {
  title: string;
  status: v69CheckoffStatus;
};

type v69CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v69LicenseStatus =
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

type v69SectionType = "PLAN" | "START";

type v69ExternalStatus = {
  newsletter?: v69NewsletterResponse;
  userTesting?: v69UserTestingResponse;
};

interface v69NewsletterResponse {
  success?: boolean;
  status: v69NewsletterStatus;
}

interface v69UserTestingResponse {
  success?: boolean;
  status: v69UserTestingStatus;
}

type v69NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v69UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v69FormationData {
  formationFormData: v69FormationFormData;
  formationResponse: v69FormationSubmitResponse | undefined;
  getFilingResponse: v69GetFilingResponse | undefined;
}

interface v69FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v69BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v69Municipality | undefined;
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
  readonly members: v69FormationAddress[];
  readonly signers: v69FormationAddress[];
  readonly paymentType: v69PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v69FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v69PaymentType = "CC" | "ACH" | undefined;

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

type v69BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v69FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v69FormationSubmitError[];
};

type v69FormationSubmitError = {
  field: string;
  message: string;
};

type v69GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v69 factories ----------------

import { v69UserData } from "@db/migrations/v69_change_form_business_entity_foreign_id";

export interface v70UserData {
  user: v70BusinessUser;
  profileData: v70ProfileData;
  formProgress: v70FormProgress;
  taskProgress: Record<string, v70TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v70LicenseData | undefined;
  preferences: v70Preferences;
  taxFilingData: v70TaxFilingData;
  formationData: v70FormationData;
  version: number;
}

export const migrate_v69_to_v70 = (v69Data: v69UserData): v70UserData => {
  const taskProgress = v69Data.taskProgress;

  return {
    ...v69Data,
    profileData: {
      ...v69Data.profileData,
      providesStaffingService: false,
    },
    taskProgress,
    version: 70,
  };
};

// ---------------- v70 types ----------------

type v70TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v70FormProgress = "UNSTARTED" | "COMPLETED";
export type v70ABExperience = "ExperienceA" | "ExperienceB";

type v70BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v70ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v70ABExperience;
};

interface v70ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v70BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v70ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;

interface v70ProfileData {
  businessPersona: v70BusinessPersona;
  initialOnboardingFlow: v70BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v70Municipality | undefined;
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
  documents: v70ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v70ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
}

type v70Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v70TaxFilingData = {
  filings: v70TaxFiling[];
};

type v70TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v70NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v70LicenseData = {
  nameAndAddress: v70NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v70LicenseStatus;
  items: v70LicenseStatusItem[];
};

type v70Preferences = {
  roadmapOpenSections: v70SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v70LicenseStatusItem = {
  title: string;
  status: v70CheckoffStatus;
};

type v70CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v70LicenseStatus =
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

type v70SectionType = "PLAN" | "START";

type v70ExternalStatus = {
  newsletter?: v70NewsletterResponse;
  userTesting?: v70UserTestingResponse;
};

interface v70NewsletterResponse {
  success?: boolean;
  status: v70NewsletterStatus;
}

interface v70UserTestingResponse {
  success?: boolean;
  status: v70UserTestingStatus;
}

type v70NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v70UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v70FormationData {
  formationFormData: v70FormationFormData;
  formationResponse: v70FormationSubmitResponse | undefined;
  getFilingResponse: v70GetFilingResponse | undefined;
}

interface v70FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v70BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v70Municipality | undefined;
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
  readonly members: v70FormationAddress[];
  readonly signers: v70FormationAddress[];
  readonly paymentType: v70PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v70FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v70PaymentType = "CC" | "ACH" | undefined;

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

type v70BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v70FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v70FormationSubmitError[];
};

type v70FormationSubmitError = {
  field: string;
  message: string;
};

type v70GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v70 factories ----------------

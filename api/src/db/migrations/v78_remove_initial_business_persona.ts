import { v77UserData } from "./v77_remove_graduation_card";

export interface v78UserData {
  user: v78BusinessUser;
  profileData: v78ProfileData;
  formProgress: v78FormProgress;
  taskProgress: Record<string, v78TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v78LicenseData | undefined;
  preferences: v78Preferences;
  taxFilingData: v78TaxFilingData;
  formationData: v78FormationData;
  version: number;
}

export const migrate_v77_to_v78 = (v77Data: v77UserData): v78UserData => {
  const { initialOnboardingFlow, ...rest } = v77Data.profileData;
  const { visibleRoadmapSidebarCards, ...restPreferences } = v77Data.preferences;

  return {
    ...v77Data,
    profileData: {
      ...rest,
      businessPersona: initialOnboardingFlow
    },
    preferences: {
      ...restPreferences,
      visibleSidebarCards: visibleRoadmapSidebarCards
    },
    version: 78
  };
};

// ---------------- v78 types ----------------

type v78TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v78FormProgress = "UNSTARTED" | "COMPLETED";
export type v78ABExperience = "ExperienceA" | "ExperienceB";

type v78BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v78ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v78ABExperience;
};

interface v78ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v78BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v78ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v78OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | undefined;

interface v78ProfileData {
  businessPersona: v78BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v78Municipality | undefined;
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
  documents: v78ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v78ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v78OperatingPhase;
}

type v78Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v78TaxFilingData = {
  filings: v78TaxFiling[];
};

type v78TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v78NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v78LicenseData = {
  nameAndAddress: v78NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v78LicenseStatus;
  items: v78LicenseStatusItem[];
};

type v78Preferences = {
  roadmapOpenSections: v78SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
};

type v78LicenseStatusItem = {
  title: string;
  status: v78CheckoffStatus;
};

type v78CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v78LicenseStatus =
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

type v78SectionType = "PLAN" | "START";

type v78ExternalStatus = {
  newsletter?: v78NewsletterResponse;
  userTesting?: v78UserTestingResponse;
};

interface v78NewsletterResponse {
  success?: boolean;
  status: v78NewsletterStatus;
}

interface v78UserTestingResponse {
  success?: boolean;
  status: v78UserTestingStatus;
}

type v78NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v78UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v78FormationData {
  formationFormData: v78FormationFormData;
  formationResponse: v78FormationSubmitResponse | undefined;
  getFilingResponse: v78GetFilingResponse | undefined;
}

interface v78FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v78BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v78Municipality | undefined;
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
  readonly members: v78FormationAddress[];
  readonly signers: v78FormationAddress[];
  readonly paymentType: v78PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v78FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v78PaymentType = "CC" | "ACH" | undefined;

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

type v78BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v78FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v78FormationSubmitError[];
};

type v78FormationSubmitError = {
  field: string;
  message: string;
};

type v78GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v78 factories ----------------

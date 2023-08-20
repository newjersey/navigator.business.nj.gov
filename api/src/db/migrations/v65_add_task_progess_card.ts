import { v64UserData } from "./v64_save_formation_address_checkboxes";

export interface v65UserData {
  user: v65BusinessUser;
  profileData: v65ProfileData;
  formProgress: v65FormProgress;
  taskProgress: Record<string, v65TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v65LicenseData | undefined;
  preferences: v65Preferences;
  taxFilingData: v65TaxFilingData;
  formationData: v65FormationData;
  version: number;
}

export const migrate_v64_to_v65 = (v64Data: v64UserData): v65UserData => {
  return {
    ...v64Data,
    preferences: {
      ...v64Data.preferences,
      visibleRoadmapSidebarCards: [...v64Data.preferences.visibleRoadmapSidebarCards, "task-progress"],
    },

    version: 65,
  };
};

// ---------------- v65 types ----------------

type v65TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v65FormProgress = "UNSTARTED" | "COMPLETED";
export type v65ABExperience = "ExperienceA" | "ExperienceB";

type v65BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v65ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v65ABExperience;
};

interface v65ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v65BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v65ForeignBusinessType = "REMOTE_SELLER" | undefined;

interface v65ProfileData {
  businessPersona: v65BusinessPersona;
  initialOnboardingFlow: v65BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v65Municipality | undefined;
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
  documents: v65ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v65ForeignBusinessType;
  foreignBusinessTypeIds: string[];
}

type v65Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v65TaxFilingData = {
  filings: v65TaxFiling[];
};

type v65TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v65NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v65LicenseData = {
  nameAndAddress: v65NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v65LicenseStatus;
  items: v65LicenseStatusItem[];
};

type v65Preferences = {
  roadmapOpenSections: v65SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v65LicenseStatusItem = {
  title: string;
  status: v65CheckoffStatus;
};

type v65CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v65LicenseStatus =
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

type v65SectionType = "PLAN" | "START";

type v65ExternalStatus = {
  newsletter?: v65NewsletterResponse;
  userTesting?: v65UserTestingResponse;
};

interface v65NewsletterResponse {
  success?: boolean;
  status: v65NewsletterStatus;
}

interface v65UserTestingResponse {
  success?: boolean;
  status: v65UserTestingStatus;
}

type v65NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v65UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v65FormationData {
  formationFormData: v65FormationFormData;
  formationResponse: v65FormationSubmitResponse | undefined;
  getFilingResponse: v65GetFilingResponse | undefined;
}

interface v65FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v65BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v65Municipality | undefined;
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
  readonly members: v65FormationAddress[];
  readonly signers: v65FormationAddress[];
  readonly paymentType: v65PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v65FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v65PaymentType = "CC" | "ACH" | undefined;

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

type v65BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v65FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v65FormationSubmitError[];
};

type v65FormationSubmitError = {
  field: string;
  message: string;
};

type v65GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v65 factories ----------------

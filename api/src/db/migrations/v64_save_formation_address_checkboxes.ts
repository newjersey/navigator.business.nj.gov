import { v63UserData } from "./v63_add_foreign_persona";

export interface v64UserData {
  user: v64BusinessUser;
  profileData: v64ProfileData;
  formProgress: v64FormProgress;
  taskProgress: Record<string, v64TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v64LicenseData | undefined;
  preferences: v64Preferences;
  taxFilingData: v64TaxFilingData;
  formationData: v64FormationData;
  version: number;
}

export const migrate_v63_to_v64 = (v63Data: v63UserData): v64UserData => {
  return {
    ...v63Data,
    formationData: {
      ...v63Data.formationData,
      formationFormData: {
        ...v63Data.formationData.formationFormData,
        agentUseBusinessAddress: false,
        agentUseAccountInfo: false
      }
    },
    version: 64
  };
};

// ---------------- v64 types ----------------

type v64TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v64FormProgress = "UNSTARTED" | "COMPLETED";
export type v64ABExperience = "ExperienceA" | "ExperienceB";

type v64BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v64ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v64ABExperience;
};

interface v64ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v64BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v64ForeignBusinessType = "REMOTE_SELLER" | undefined;

interface v64ProfileData {
  businessPersona: v64BusinessPersona;
  initialOnboardingFlow: v64BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v64Municipality | undefined;
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
  documents: v64ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v64ForeignBusinessType;
  foreignBusinessTypeIds: string[];
}

type v64Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v64TaxFilingData = {
  filings: v64TaxFiling[];
};

type v64TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v64NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v64LicenseData = {
  nameAndAddress: v64NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v64LicenseStatus;
  items: v64LicenseStatusItem[];
};

type v64Preferences = {
  roadmapOpenSections: v64SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v64LicenseStatusItem = {
  title: string;
  status: v64CheckoffStatus;
};

type v64CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v64LicenseStatus =
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

type v64SectionType = "PLAN" | "START";

type v64ExternalStatus = {
  newsletter?: v64NewsletterResponse;
  userTesting?: v64UserTestingResponse;
};

interface v64NewsletterResponse {
  success?: boolean;
  status: v64NewsletterStatus;
}

interface v64UserTestingResponse {
  success?: boolean;
  status: v64UserTestingStatus;
}

type v64NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v64UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v64FormationData {
  formationFormData: v64FormationFormData;
  formationResponse: v64FormationSubmitResponse | undefined;
  getFilingResponse: v64GetFilingResponse | undefined;
}

interface v64FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v64BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v64Municipality | undefined;
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
  readonly members: v64FormationAddress[];
  readonly signers: v64FormationAddress[];
  readonly paymentType: v64PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v64FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v64PaymentType = "CC" | "ACH" | undefined;

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

type v64BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v64FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v64FormationSubmitError[];
};

type v64FormationSubmitError = {
  field: string;
  message: string;
};

type v64GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v64 factories ----------------

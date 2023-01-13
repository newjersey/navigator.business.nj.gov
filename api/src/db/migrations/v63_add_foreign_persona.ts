import { v62UserData } from "./v62_rename_has_existing_business";

export interface v63UserData {
  user: v63BusinessUser;
  profileData: v63ProfileData;
  formProgress: v63FormProgress;
  taskProgress: Record<string, v63TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v63LicenseData | undefined;
  preferences: v63Preferences;
  taxFilingData: v63TaxFilingData;
  formationData: v63FormationData;
  version: number;
}

export const migrate_v62_to_v63 = (v62Data: v62UserData): v63UserData => {
  return {
    ...v62Data,
    profileData: {
      ...v62Data.profileData,
      foreignBusinessType: undefined,
      foreignBusinessTypeIds: [],
    },
    version: 63,
  };
};

// ---------------- v63 types ----------------

type v63TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v63FormProgress = "UNSTARTED" | "COMPLETED";
export type v63ABExperience = "ExperienceA" | "ExperienceB";

type v63BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v63ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v63ABExperience;
};

interface v63ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v63BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v63ForeignBusinessType = "REMOTE_SELLER" | undefined;

interface v63ProfileData {
  businessPersona: v63BusinessPersona;
  initialOnboardingFlow: v63BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v63Municipality | undefined;
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
  documents: v63ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v63ForeignBusinessType;
  foreignBusinessTypeIds: string[];
}

type v63Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v63TaxFilingData = {
  filings: v63TaxFiling[];
};

type v63TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v63NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v63LicenseData = {
  nameAndAddress: v63NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v63LicenseStatus;
  items: v63LicenseStatusItem[];
};

type v63Preferences = {
  roadmapOpenSections: v63SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v63LicenseStatusItem = {
  title: string;
  status: v63CheckoffStatus;
};

type v63CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v63LicenseStatus =
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

type v63SectionType = "PLAN" | "START";

type v63ExternalStatus = {
  newsletter?: v63NewsletterResponse;
  userTesting?: v63UserTestingResponse;
};

interface v63NewsletterResponse {
  success?: boolean;
  status: v63NewsletterStatus;
}

interface v63UserTestingResponse {
  success?: boolean;
  status: v63UserTestingStatus;
}

type v63NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v63UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v63FormationData {
  formationFormData: v63FormationFormData;
  formationResponse: v63FormationSubmitResponse | undefined;
  getFilingResponse: v63GetFilingResponse | undefined;
}

interface v63FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v63BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v63Municipality | undefined;
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
  readonly members: v63FormationAddress[];
  readonly signers: v63FormationAddress[];
  readonly paymentType: v63PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v63FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v63PaymentType = "CC" | "ACH" | undefined;

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

export const createEmptyFormationAddress = (): v63FormationAddress => {
  return {
    name: "",
    addressLine1: "",
    addressLine2: "",
    addressCity: "",
    addressState: "",
    addressZipCode: "",
    signature: false,
  };
};

const AllBusinessSuffixes = [...llcBusinessSuffix, ...llpBusinessSuffix, ...corpBusinessSuffix] as const;

type v63BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v63FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v63FormationSubmitError[];
};

type v63FormationSubmitError = {
  field: string;
  message: string;
};

type v63GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v63 factories ----------------

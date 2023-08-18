import { v61UserData } from "./v61_add_corp_formation";

export interface v62UserData {
  user: v62BusinessUser;
  profileData: v62ProfileData;
  formProgress: v62FormProgress;
  taskProgress: Record<string, v62TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v62LicenseData | undefined;
  preferences: v62Preferences;
  taxFilingData: v62TaxFilingData;
  formationData: v62FormationData;
  version: number;
}

export const migrate_v61_to_v62 = (v61Data: v61UserData): v62UserData => {
  const { hasExistingBusiness, ...rest } = v61Data.profileData;

  return {
    ...v61Data,
    profileData: {
      ...rest,
      businessPersona: hasExistingBusiness ? "OWNING" : "STARTING"
    },
    version: 62
  };
};

// ---------------- v62 types ----------------

type v62TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v62FormProgress = "UNSTARTED" | "COMPLETED";
export type v62ABExperience = "ExperienceA" | "ExperienceB";

type v62BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v62ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v62ABExperience;
};

interface v62ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}
interface v62ProfileData {
  businessPersona: "STARTING" | "OWNING" | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v62Municipality | undefined;
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
  documents: v62ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
}

type v62Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v62TaxFilingData = {
  filings: v62TaxFiling[];
};

type v62TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v62NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v62LicenseData = {
  nameAndAddress: v62NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v62LicenseStatus;
  items: v62LicenseStatusItem[];
};

type v62Preferences = {
  roadmapOpenSections: v62SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v62LicenseStatusItem = {
  title: string;
  status: v62CheckoffStatus;
};

type v62CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v62LicenseStatus =
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

type v62SectionType = "PLAN" | "START";

type v62ExternalStatus = {
  newsletter?: v62NewsletterResponse;
  userTesting?: v62UserTestingResponse;
};

interface v62NewsletterResponse {
  success?: boolean;
  status: v62NewsletterStatus;
}

interface v62UserTestingResponse {
  success?: boolean;
  status: v62UserTestingStatus;
}

type v62NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v62UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v62FormationData {
  formationFormData: v62FormationFormData;
  formationResponse: v62FormationSubmitResponse | undefined;
  getFilingResponse: v62GetFilingResponse | undefined;
}

interface v62FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v62BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v62Municipality | undefined;
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
  readonly members: v62FormationAddress[];
  readonly signers: v62FormationAddress[];
  readonly paymentType: v62PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v62FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v62PaymentType = "CC" | "ACH" | undefined;

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

export const createEmptyFormationAddress = (): v62FormationAddress => {
  return {
    name: "",
    addressLine1: "",
    addressLine2: "",
    addressCity: "",
    addressState: "",
    addressZipCode: "",
    signature: false
  };
};

const AllBusinessSuffixes = [...llcBusinessSuffix, ...llpBusinessSuffix, ...corpBusinessSuffix] as const;

type v62BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v62FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v62FormationSubmitError[];
};

type v62FormationSubmitError = {
  field: string;
  message: string;
};

type v62GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v62 factories ----------------

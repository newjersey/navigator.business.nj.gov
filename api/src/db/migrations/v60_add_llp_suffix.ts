import { v59UserData } from "./v59_fix_welcome_card_to_preferences";

export interface v60UserData {
  user: v60BusinessUser;
  profileData: v60ProfileData;
  formProgress: v60FormProgress;
  taskProgress: Record<string, v60TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v60LicenseData | undefined;
  preferences: v60Preferences;
  taxFilingData: v60TaxFilingData;
  formationData: v60FormationData;
  version: number;
}

export const migrate_v59_to_v60 = (v59Data: v59UserData): v60UserData => {
  return {
    ...v59Data,
    formationData: {
      ...v59Data.formationData,
      formationFormData: {
        businessName: "",
        businessAddressCity: undefined,
        provisions: [],
        businessPurpose: "",
        ...v59Data.formationData.formationFormData,
        signer: v59Data.formationData.formationFormData.signer as unknown as v60FormationSigner,
        additionalSigners: v59Data.formationData.formationFormData
          .additionalSigners as unknown as v60FormationSigner[]
      }
    },
    version: 60
  };
};

// ---------------- v60 types ----------------

type v60TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v60FormProgress = "UNSTARTED" | "COMPLETED";
export type v60ABExperience = "ExperienceA" | "ExperienceB";

type v60BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v60ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v60ABExperience;
};

interface v60ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}
interface v60ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v60Municipality | undefined;
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
  documents: v60ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
}

type v60Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v60TaxFilingData = {
  filings: v60TaxFiling[];
};

type v60TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v60NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v60LicenseData = {
  nameAndAddress: v60NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v60LicenseStatus;
  items: v60LicenseStatusItem[];
};

type v60Preferences = {
  roadmapOpenSections: v60SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v60LicenseStatusItem = {
  title: string;
  status: v60CheckoffStatus;
};

type v60CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v60LicenseStatus =
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

type v60SectionType = "PLAN" | "START";

type v60ExternalStatus = {
  newsletter?: v60NewsletterResponse;
  userTesting?: v60UserTestingResponse;
};

interface v60NewsletterResponse {
  success?: boolean;
  status: v60NewsletterStatus;
}

interface v60UserTestingResponse {
  success?: boolean;
  status: v60UserTestingStatus;
}

type v60NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v60UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v60FormationData {
  formationFormData: v60FormationFormData;
  formationResponse: v60FormationSubmitResponse | undefined;
  getFilingResponse: v60GetFilingResponse | undefined;
}

interface v60FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}
interface v60FormationSigner {
  name: string;
  signature: boolean;
}

interface v60FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v60BusinessSuffix | undefined;
  readonly businessStartDate: string;
  readonly businessAddressCity: v60Municipality | undefined;
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
  readonly members: v60FormationMember[];
  readonly signer: v60FormationSigner;
  readonly additionalSigners: v60FormationSigner[];
  readonly paymentType: v60PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

type v60PaymentType = "CC" | "ACH" | undefined;

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

const AllBusinessSuffixes = [...llcBusinessSuffix, ...llpBusinessSuffix] as const;

type v60BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v60FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v60FormationSubmitError[];
};

type v60FormationSubmitError = {
  field: string;
  message: string;
};

type v60GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v60 factories ----------------

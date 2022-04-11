import { v47UserData } from "./v47_add_profile_documents";

export interface v48UserData {
  user: v48BusinessUser;
  profileData: v48ProfileData;
  formProgress: v48FormProgress;
  taskProgress: Record<string, v48TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v48LicenseData | undefined;
  preferences: v48Preferences;
  taxFilingData: v48TaxFilingData;
  formationData: v48FormationData;
  version: number;
}

export const migrate_v47_to_v48 = (v47Data: v47UserData): v48UserData => {
  return {
    ...v47Data,
    user: {
      ...v47Data.user,
      abExperience: Math.random() % 2 === 0 ? "ExperienceA" : "ExperienceB",
    },
    version: 48,
  };
};

// ---------------- v48 types ----------------

type v48TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v48FormProgress = "UNSTARTED" | "COMPLETED";
export type v48ABExperience = "ExperienceA" | "ExperienceB";

type v48BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v48ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v48ABExperience;
};

interface v48ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}
interface v48ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v48Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v48ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
}

type v48Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v48TaxFilingData = {
  filings: v48TaxFiling[];
};

type v48TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v48NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v48LicenseData = {
  nameAndAddress: v48NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v48LicenseStatus;
  items: v48LicenseStatusItem[];
};

type v48Preferences = {
  roadmapOpenSections: v48SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v48LicenseStatusItem = {
  title: string;
  status: v48CheckoffStatus;
};

type v48CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v48LicenseStatus =
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

type v48SectionType = "PLAN" | "START";

type v48ExternalStatus = {
  newsletter?: v48NewsletterResponse;
  userTesting?: v48UserTestingResponse;
};

interface v48NewsletterResponse {
  success?: boolean;
  status: v48NewsletterStatus;
}

interface v48UserTestingResponse {
  success?: boolean;
  status: v48UserTestingStatus;
}

type v48NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v48UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v48FormationData {
  formationFormData: v48FormationFormData;
  formationResponse: v48FormationSubmitResponse | undefined;
  getFilingResponse: v48GetFilingResponse | undefined;
}

interface v48FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v48FormationFormData {
  businessSuffix: v48BusinessSuffix | undefined;
  businessStartDate: string;
  businessAddressLine1: string;
  businessAddressLine2: string;
  businessAddressState: string;
  businessAddressZipCode: string;
  agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  agentNumber: string;
  agentName: string;
  agentEmail: string;
  agentOfficeAddressLine1: string;
  agentOfficeAddressLine2: string;
  agentOfficeAddressCity: string;
  agentOfficeAddressState: string;
  agentOfficeAddressZipCode: string;
  members: v48FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v48PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v48PaymentType = "CC" | "ACH" | undefined;

type v48BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v48FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v48FormationSubmitError[];
};

type v48FormationSubmitError = {
  field: string;
  message: string;
};

type v48GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v48 factories ----------------

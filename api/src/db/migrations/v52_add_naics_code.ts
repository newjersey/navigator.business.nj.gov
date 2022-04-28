import { v51UserData } from "./v51_add_cpa_field";

export interface v52UserData {
  user: v52BusinessUser;
  profileData: v52ProfileData;
  formProgress: v52FormProgress;
  taskProgress: Record<string, v52TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v52LicenseData | undefined;
  preferences: v52Preferences;
  taxFilingData: v52TaxFilingData;
  formationData: v52FormationData;
  version: number;
}

export const migrate_v51_to_v52 = (v51Data: v51UserData): v52UserData => {
  return {
    ...v51Data,
    profileData: {
      ...v51Data.profileData,
      naicsCode: "",
    },
    version: 52,
  };
};

// ---------------- v52 types ----------------

type v52TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v52FormProgress = "UNSTARTED" | "COMPLETED";
export type v52ABExperience = "ExperienceA" | "ExperienceB";

type v52BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v52ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v52ABExperience;
};

interface v52ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}
interface v52ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v52Municipality | undefined;
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v52ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
}

type v52Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v52TaxFilingData = {
  filings: v52TaxFiling[];
};

type v52TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v52NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v52LicenseData = {
  nameAndAddress: v52NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v52LicenseStatus;
  items: v52LicenseStatusItem[];
};

type v52Preferences = {
  roadmapOpenSections: v52SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v52LicenseStatusItem = {
  title: string;
  status: v52CheckoffStatus;
};

type v52CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v52LicenseStatus =
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

type v52SectionType = "PLAN" | "START";

type v52ExternalStatus = {
  newsletter?: v52NewsletterResponse;
  userTesting?: v52UserTestingResponse;
};

interface v52NewsletterResponse {
  success?: boolean;
  status: v52NewsletterStatus;
}

interface v52UserTestingResponse {
  success?: boolean;
  status: v52UserTestingStatus;
}

type v52NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v52UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v52FormationData {
  formationFormData: v52FormationFormData;
  formationResponse: v52FormationSubmitResponse | undefined;
  getFilingResponse: v52GetFilingResponse | undefined;
}

interface v52FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v52FormationFormData {
  businessSuffix: v52BusinessSuffix | undefined;
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
  members: v52FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v52PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v52PaymentType = "CC" | "ACH" | undefined;

type v52BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v52FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v52FormationSubmitError[];
};

type v52FormationSubmitError = {
  field: string;
  message: string;
};

type v52GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v52 factories ----------------

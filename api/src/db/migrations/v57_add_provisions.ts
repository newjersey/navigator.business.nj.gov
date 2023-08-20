import { v56UserData } from "./v56_cleaning_janatorial";

export interface v57UserData {
  user: v57BusinessUser;
  profileData: v57ProfileData;
  formProgress: v57FormProgress;
  taskProgress: Record<string, v57TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v57LicenseData | undefined;
  preferences: v57Preferences;
  taxFilingData: v57TaxFilingData;
  formationData: v57FormationData;
  version: number;
}

export const migrate_v56_to_v57 = (v56Data: v56UserData): v57UserData => {
  return {
    ...v56Data,
    formationData: {
      ...v56Data.formationData,
      formationFormData: {
        ...v56Data.formationData.formationFormData,
        provisions: [],
      },
    },
    version: 57,
  };
};

// ---------------- v57 types ----------------

type v57TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v57FormProgress = "UNSTARTED" | "COMPLETED";
export type v57ABExperience = "ExperienceA" | "ExperienceB";

type v57BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v57ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v57ABExperience;
};

interface v57ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

export interface v57ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v57Municipality | undefined;
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
  documents: v57ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
}

type v57Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v57TaxFilingData = {
  filings: v57TaxFiling[];
};

type v57TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v57NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v57LicenseData = {
  nameAndAddress: v57NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v57LicenseStatus;
  items: v57LicenseStatusItem[];
};

type v57Preferences = {
  roadmapOpenSections: v57SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v57LicenseStatusItem = {
  title: string;
  status: v57CheckoffStatus;
};

type v57CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v57LicenseStatus =
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

type v57SectionType = "PLAN" | "START";

type v57ExternalStatus = {
  newsletter?: v57NewsletterResponse;
  userTesting?: v57UserTestingResponse;
};

interface v57NewsletterResponse {
  success?: boolean;
  status: v57NewsletterStatus;
}

interface v57UserTestingResponse {
  success?: boolean;
  status: v57UserTestingStatus;
}

type v57NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v57UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v57FormationData {
  formationFormData: v57FormationFormData;
  formationResponse: v57FormationSubmitResponse | undefined;
  getFilingResponse: v57GetFilingResponse | undefined;
}

interface v57FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v57FormationFormData {
  businessSuffix: v57BusinessSuffix | undefined;
  businessStartDate: string;
  businessAddressLine1: string;
  businessAddressLine2: string;
  businessAddressState: string;
  businessAddressZipCode: string;
  businessPurpose: string;
  provisions: string[];
  agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  agentNumber: string;
  agentName: string;
  agentEmail: string;
  agentOfficeAddressLine1: string;
  agentOfficeAddressLine2: string;
  agentOfficeAddressCity: string;
  agentOfficeAddressState: string;
  agentOfficeAddressZipCode: string;
  members: v57FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v57PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v57PaymentType = "CC" | "ACH" | undefined;

type v57BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v57FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v57FormationSubmitError[];
};

type v57FormationSubmitError = {
  field: string;
  message: string;
};

type v57GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v57 factories ----------------

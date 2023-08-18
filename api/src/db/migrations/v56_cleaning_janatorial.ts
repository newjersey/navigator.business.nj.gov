import { v55UserData } from "./v55_marketing_and_pr";

export interface v56UserData {
  user: v56BusinessUser;
  profileData: v56ProfileData;
  formProgress: v56FormProgress;
  taskProgress: Record<string, v56TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v56LicenseData | undefined;
  preferences: v56Preferences;
  taxFilingData: v56TaxFilingData;
  formationData: v56FormationData;
  version: number;
}

export const migrate_v55_to_v56 = (v55Data: v55UserData): v56UserData => {
  const newIndustryId =
    v55Data.profileData.industryId === "janitorial-services" ||
    v55Data.profileData.industryId === "cleaning-aid"
      ? "cleaning-janitorial-services"
      : v55Data.profileData.industryId;
  return {
    ...v55Data,
    profileData: {
      ...v55Data.profileData,
      industryId: newIndustryId
    },
    version: 56
  };
};

// ---------------- v56 types ----------------

type v56TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v56FormProgress = "UNSTARTED" | "COMPLETED";
export type v56ABExperience = "ExperienceA" | "ExperienceB";

type v56BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v56ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v56ABExperience;
};

interface v56ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

export interface v56ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v56Municipality | undefined;
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
  documents: v56ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
}

type v56Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v56TaxFilingData = {
  filings: v56TaxFiling[];
};

type v56TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v56NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v56LicenseData = {
  nameAndAddress: v56NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v56LicenseStatus;
  items: v56LicenseStatusItem[];
};

type v56Preferences = {
  roadmapOpenSections: v56SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v56LicenseStatusItem = {
  title: string;
  status: v56CheckoffStatus;
};

type v56CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v56LicenseStatus =
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

type v56SectionType = "PLAN" | "START";

type v56ExternalStatus = {
  newsletter?: v56NewsletterResponse;
  userTesting?: v56UserTestingResponse;
};

interface v56NewsletterResponse {
  success?: boolean;
  status: v56NewsletterStatus;
}

interface v56UserTestingResponse {
  success?: boolean;
  status: v56UserTestingStatus;
}

type v56NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v56UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v56FormationData {
  formationFormData: v56FormationFormData;
  formationResponse: v56FormationSubmitResponse | undefined;
  getFilingResponse: v56GetFilingResponse | undefined;
}

interface v56FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v56FormationFormData {
  businessSuffix: v56BusinessSuffix | undefined;
  businessStartDate: string;
  businessAddressLine1: string;
  businessAddressLine2: string;
  businessAddressState: string;
  businessAddressZipCode: string;
  businessPurpose: string;
  agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  agentNumber: string;
  agentName: string;
  agentEmail: string;
  agentOfficeAddressLine1: string;
  agentOfficeAddressLine2: string;
  agentOfficeAddressCity: string;
  agentOfficeAddressState: string;
  agentOfficeAddressZipCode: string;
  members: v56FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v56PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v56PaymentType = "CC" | "ACH" | undefined;

type v56BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v56FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v56FormationSubmitError[];
};

type v56FormationSubmitError = {
  field: string;
  message: string;
};

type v56GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v56 factories ----------------

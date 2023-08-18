import { v50UserData } from "./v50_fix_annual_conditional_ids";

export interface v51UserData {
  user: v51BusinessUser;
  profileData: v51ProfileData;
  formProgress: v51FormProgress;
  taskProgress: Record<string, v51TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v51LicenseData | undefined;
  preferences: v51Preferences;
  taxFilingData: v51TaxFilingData;
  formationData: v51FormationData;
  version: number;
}

export const migrate_v50_to_v51 = (v50Data: v50UserData): v51UserData => {
  return {
    ...v50Data,
    profileData: {
      ...v50Data.profileData,
      requiresCpa: v50Data.profileData.industryId === "certified-public-accountant" ? true : false
    },
    version: 51
  };
};

// ---------------- v51 types ----------------

type v51TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v51FormProgress = "UNSTARTED" | "COMPLETED";
export type v51ABExperience = "ExperienceA" | "ExperienceB";

type v51BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v51ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v51ABExperience;
};

interface v51ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}
interface v51ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v51Municipality | undefined;
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
  documents: v51ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
}

type v51Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v51TaxFilingData = {
  filings: v51TaxFiling[];
};

type v51TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v51NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v51LicenseData = {
  nameAndAddress: v51NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v51LicenseStatus;
  items: v51LicenseStatusItem[];
};

type v51Preferences = {
  roadmapOpenSections: v51SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v51LicenseStatusItem = {
  title: string;
  status: v51CheckoffStatus;
};

type v51CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v51LicenseStatus =
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

type v51SectionType = "PLAN" | "START";

type v51ExternalStatus = {
  newsletter?: v51NewsletterResponse;
  userTesting?: v51UserTestingResponse;
};

interface v51NewsletterResponse {
  success?: boolean;
  status: v51NewsletterStatus;
}

interface v51UserTestingResponse {
  success?: boolean;
  status: v51UserTestingStatus;
}

type v51NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v51UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v51FormationData {
  formationFormData: v51FormationFormData;
  formationResponse: v51FormationSubmitResponse | undefined;
  getFilingResponse: v51GetFilingResponse | undefined;
}

interface v51FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v51FormationFormData {
  businessSuffix: v51BusinessSuffix | undefined;
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
  members: v51FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v51PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v51PaymentType = "CC" | "ACH" | undefined;

type v51BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v51FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v51FormationSubmitError[];
};

type v51FormationSubmitError = {
  field: string;
  message: string;
};

type v51GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v51 factories ----------------

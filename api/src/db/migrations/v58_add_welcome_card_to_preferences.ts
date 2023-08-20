import { v57UserData } from "./v57_add_provisions";

export interface v58UserData {
  user: v58BusinessUser;
  profileData: v58ProfileData;
  formProgress: v58FormProgress;
  taskProgress: Record<string, v58TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v58LicenseData | undefined;
  preferences: v58Preferences;
  taxFilingData: v58TaxFilingData;
  formationData: v58FormationData;
  version: number;
}

export const migrate_v57_to_v58 = (v57Data: v57UserData): v58UserData => {
  return {
    ...v57Data,
    preferences: {
      ...v57Data.preferences,
      visibleRoadmapSidebarCards: ["welcome"],
    },
    version: 58,
  };
};

// ---------------- v58 types ----------------

type v58TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v58FormProgress = "UNSTARTED" | "COMPLETED";
export type v58ABExperience = "ExperienceA" | "ExperienceB";

type v58BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v58ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v58ABExperience;
};

interface v58ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}
interface v58ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v58Municipality | undefined;
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
  documents: v58ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
}

type v58Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v58TaxFilingData = {
  filings: v58TaxFiling[];
};

type v58TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v58NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v58LicenseData = {
  nameAndAddress: v58NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v58LicenseStatus;
  items: v58LicenseStatusItem[];
};

type v58Preferences = {
  roadmapOpenSections: v58SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v58LicenseStatusItem = {
  title: string;
  status: v58CheckoffStatus;
};

type v58CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v58LicenseStatus =
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

type v58SectionType = "PLAN" | "START";

type v58ExternalStatus = {
  newsletter?: v58NewsletterResponse;
  userTesting?: v58UserTestingResponse;
};

interface v58NewsletterResponse {
  success?: boolean;
  status: v58NewsletterStatus;
}

interface v58UserTestingResponse {
  success?: boolean;
  status: v58UserTestingStatus;
}

type v58NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v58UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v58FormationData {
  formationFormData: v58FormationFormData;
  formationResponse: v58FormationSubmitResponse | undefined;
  getFilingResponse: v58GetFilingResponse | undefined;
}

interface v58FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v58FormationFormData {
  businessSuffix: v58BusinessSuffix | undefined;
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
  members: v58FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v58PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v58PaymentType = "CC" | "ACH" | undefined;

type v58BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v58FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v58FormationSubmitError[];
};

type v58FormationSubmitError = {
  field: string;
  message: string;
};

type v58GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v58 factories ----------------

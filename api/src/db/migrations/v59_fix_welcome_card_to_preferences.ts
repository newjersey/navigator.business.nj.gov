import { v58UserData } from "./v58_add_welcome_card_to_preferences";

export interface v59UserData {
  user: v59BusinessUser;
  profileData: v59ProfileData;
  formProgress: v59FormProgress;
  taskProgress: Record<string, v59TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v59LicenseData | undefined;
  preferences: v59Preferences;
  taxFilingData: v59TaxFilingData;
  formationData: v59FormationData;
  version: number;
}

export const migrate_v58_to_v59 = (v58Data: v58UserData): v59UserData => {
  const removedWelcomeCard = v58Data.preferences.visibleRoadmapSidebarCards.filter((id) => {
    return id !== "welcome";
  });

  return {
    ...v58Data,
    preferences: {
      ...v58Data.preferences,
      visibleRoadmapSidebarCards: [...removedWelcomeCard, "welcome"],
    },
    version: 59,
  };
};

// ---------------- v59 types ----------------

type v59TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v59FormProgress = "UNSTARTED" | "COMPLETED";
export type v59ABExperience = "ExperienceA" | "ExperienceB";

type v59BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v59ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v59ABExperience;
};

interface v59ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}
interface v59ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v59Municipality | undefined;
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
  documents: v59ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
}

type v59Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v59TaxFilingData = {
  filings: v59TaxFiling[];
};

type v59TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v59NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v59LicenseData = {
  nameAndAddress: v59NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v59LicenseStatus;
  items: v59LicenseStatusItem[];
};

type v59Preferences = {
  roadmapOpenSections: v59SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v59LicenseStatusItem = {
  title: string;
  status: v59CheckoffStatus;
};

type v59CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v59LicenseStatus =
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

type v59SectionType = "PLAN" | "START";

type v59ExternalStatus = {
  newsletter?: v59NewsletterResponse;
  userTesting?: v59UserTestingResponse;
};

interface v59NewsletterResponse {
  success?: boolean;
  status: v59NewsletterStatus;
}

interface v59UserTestingResponse {
  success?: boolean;
  status: v59UserTestingStatus;
}

type v59NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v59UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v59FormationData {
  formationFormData: v59FormationFormData;
  formationResponse: v59FormationSubmitResponse | undefined;
  getFilingResponse: v59GetFilingResponse | undefined;
}

interface v59FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v59FormationFormData {
  businessSuffix: v59BusinessSuffix | undefined;
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
  members: v59FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v59PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v59PaymentType = "CC" | "ACH" | undefined;

type v59BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v59FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v59FormationSubmitError[];
};

type v59FormationSubmitError = {
  field: string;
  message: string;
};

type v59GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v59 factories ----------------

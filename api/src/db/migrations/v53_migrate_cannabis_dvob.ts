import { v52UserData } from "@db/migrations/v52_add_naics_code";

export interface v53UserData {
  user: v53BusinessUser;
  profileData: v53ProfileData;
  formProgress: v53FormProgress;
  taskProgress: Record<string, v53TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v53LicenseData | undefined;
  preferences: v53Preferences;
  taxFilingData: v53TaxFilingData;
  formationData: v53FormationData;
  version: number;
}

export const migrate_v52_to_v53 = (v52Data: v52UserData): v53UserData => {
  const vetOwnedValue = v52Data.taskItemChecklist["general-veteran-owned"];
  delete v52Data.taskItemChecklist["general-veteran-owned"];
  return {
    ...v52Data,
    profileData: {
      ...v52Data.profileData,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cannabisMicrobusiness: v52Data.cannabisMicrobusiness ?? undefined,
    },
    taskItemChecklist: {
      ...v52Data.taskItemChecklist,
      "general-dvob": vetOwnedValue,
    },
    version: 53,
  };
};

// ---------------- v53 types ----------------

type v53TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v53FormProgress = "UNSTARTED" | "COMPLETED";
export type v53ABExperience = "ExperienceA" | "ExperienceB";

type v53BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v53ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v53ABExperience;
};

interface v53ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}
interface v53ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v53Municipality | undefined;
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
  documents: v53ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
}

type v53Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v53TaxFilingData = {
  filings: v53TaxFiling[];
};

type v53TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v53NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v53LicenseData = {
  nameAndAddress: v53NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v53LicenseStatus;
  items: v53LicenseStatusItem[];
};

type v53Preferences = {
  roadmapOpenSections: v53SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v53LicenseStatusItem = {
  title: string;
  status: v53CheckoffStatus;
};

type v53CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v53LicenseStatus =
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

type v53SectionType = "PLAN" | "START";

type v53ExternalStatus = {
  newsletter?: v53NewsletterResponse;
  userTesting?: v53UserTestingResponse;
};

interface v53NewsletterResponse {
  success?: boolean;
  status: v53NewsletterStatus;
}

interface v53UserTestingResponse {
  success?: boolean;
  status: v53UserTestingStatus;
}

type v53NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v53UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v53FormationData {
  formationFormData: v53FormationFormData;
  formationResponse: v53FormationSubmitResponse | undefined;
  getFilingResponse: v53GetFilingResponse | undefined;
}

interface v53FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v53FormationFormData {
  businessSuffix: v53BusinessSuffix | undefined;
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
  members: v53FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v53PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v53PaymentType = "CC" | "ACH" | undefined;

type v53BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v53FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v53FormationSubmitError[];
};

type v53FormationSubmitError = {
  field: string;
  message: string;
};

type v53GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v53 factories ----------------

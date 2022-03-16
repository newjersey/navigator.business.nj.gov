import { v44UserData } from "./v44_add_cannabis_license_to_profile_data";

export interface v45UserData {
  user: v45BusinessUser;
  profileData: v45ProfileData;
  formProgress: v45FormProgress;
  taskProgress: Record<string, v45TaskProgress>;
  licenseData: v45LicenseData | undefined;
  preferences: v45Preferences;
  taxFilingData: v45TaxFilingData;
  formationData: v45FormationData;
  version: number;
}

export const migrate_v44_to_v45 = (v44Data: v44UserData): v45UserData => {
  return {
    ...v44Data,
    preferences: {
      ...v44Data.preferences,
      hiddenCertificationIds: [],
      hiddenFundingIds: [],
    },
    version: 45,
  };
};

// ---------------- v45 types ----------------

type v45TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v45FormProgress = "UNSTARTED" | "COMPLETED";

type v45BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v45ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v45ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v45Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
}

type v45Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v45TaxFilingData = {
  filings: v45TaxFiling[];
};

type v45TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v45NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v45LicenseData = {
  nameAndAddress: v45NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v45LicenseStatus;
  items: v45LicenseStatusItem[];
};

type v45Preferences = {
  roadmapOpenSections: v45SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
};

type v45LicenseStatusItem = {
  title: string;
  status: v45CheckoffStatus;
};

type v45CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v45LicenseStatus =
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

type v45SectionType = "PLAN" | "START";

type v45ExternalStatus = {
  newsletter?: v45NewsletterResponse;
  userTesting?: v45UserTestingResponse;
};

interface v45NewsletterResponse {
  success?: boolean;
  status: v45NewsletterStatus;
}

interface v45UserTestingResponse {
  success?: boolean;
  status: v45UserTestingStatus;
}

type v45NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v45UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v45FormationData {
  formationFormData: v45FormationFormData;
  formationResponse: v45FormationSubmitResponse | undefined;
  getFilingResponse: v45GetFilingResponse | undefined;
}

interface v45FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v45FormationFormData {
  businessSuffix: v45BusinessSuffix | undefined;
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
  members: v45FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v45PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v45PaymentType = "CC" | "ACH" | undefined;

type v45BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v45FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v45FormationSubmitError[];
};

type v45FormationSubmitError = {
  field: string;
  message: string;
};

type v45GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v45 factories ----------------

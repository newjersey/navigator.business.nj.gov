import { v42UserData } from "./v42_add_sector_to_profile_data";

export interface v43UserData {
  user: v43BusinessUser;
  profileData: v43ProfileData;
  formProgress: v43FormProgress;
  taskProgress: Record<string, v43TaskProgress>;
  licenseData: v43LicenseData | undefined;
  preferences: v43Preferences;
  taxFilingData: v43TaxFilingData;
  formationData: v43FormationData;
  version: number;
}

export const migrate_v42_to_v43 = (v42Data: v42UserData): v43UserData => {
  const getOnboardingFlow = (hasExistingBusiness: boolean | undefined): "STARTING" | "OWNING" | undefined => {
    if (hasExistingBusiness === true) {
      return "OWNING";
    } else if (hasExistingBusiness === false) {
      return "STARTING";
    } else {
      return undefined;
    }
  };

  return {
    ...v42Data,
    profileData: {
      ...v42Data.profileData,
      initialOnboardingFlow: getOnboardingFlow(v42Data.profileData.hasExistingBusiness),
    },
    version: 43,
  };
};

// ---------------- v43 types ----------------

type v43TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v43FormProgress = "UNSTARTED" | "COMPLETED";

type v43BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v43ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v43ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v43Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
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

type v43Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v43TaxFilingData = {
  filings: v43TaxFiling[];
};

type v43TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v43NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v43LicenseData = {
  nameAndAddress: v43NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v43LicenseStatus;
  items: v43LicenseStatusItem[];
};

type v43Preferences = {
  roadmapOpenSections: v43SectionType[];
  roadmapOpenSteps: number[];
};

type v43LicenseStatusItem = {
  title: string;
  status: v43CheckoffStatus;
};

type v43CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v43LicenseStatus =
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

type v43SectionType = "PLAN" | "START";

type v43ExternalStatus = {
  newsletter?: v43NewsletterResponse;
  userTesting?: v43UserTestingResponse;
};

interface v43NewsletterResponse {
  success?: boolean;
  status: v43NewsletterStatus;
}

interface v43UserTestingResponse {
  success?: boolean;
  status: v43UserTestingStatus;
}

type v43NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v43UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v43FormationData {
  formationFormData: v43FormationFormData;
  formationResponse: v43FormationSubmitResponse | undefined;
  getFilingResponse: v43GetFilingResponse | undefined;
}

interface v43FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v43FormationFormData {
  businessSuffix: v43BusinessSuffix | undefined;
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
  members: v43FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v43PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v43PaymentType = "CC" | "ACH" | undefined;

type v43BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v43FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v43FormationSubmitError[];
};

type v43FormationSubmitError = {
  field: string;
  message: string;
};

type v43GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v43 factories ----------------

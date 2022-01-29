import { v37UserData } from "./v37_add_dateofformation";

export interface v38UserData {
  user: v38BusinessUser;
  profileData: v38ProfileData;
  formProgress: v38FormProgress;
  taskProgress: Record<string, v38TaskProgress>;
  licenseData: v38LicenseData | undefined;
  preferences: v38Preferences;
  taxFilingData: v38TaxFilingData;
  formationData: v38FormationData;
  version: number;
}

export const migrate_v37_to_v38 = (v37Data: v37UserData): v38UserData => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { certificationIds, ...profileData } = v37Data.profileData;

  return {
    ...v37Data,
    profileData: { ...profileData, ownershipTypeIds: [] },
    version: 37,
  };
};

// ---------------- v38 types ----------------

type v38TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v38FormProgress = "UNSTARTED" | "COMPLETED";

type v38BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v38ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v38ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v38Municipality | undefined;
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
}

type v38Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v38TaxFilingData = {
  entityIdStatus: v38EntityIdStatus;
  filings: v38TaxFiling[];
};

type v38EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

type v38TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v38NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v38LicenseData = {
  nameAndAddress: v38NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v38LicenseStatus;
  items: v38LicenseStatusItem[];
};

type v38Preferences = {
  roadmapOpenSections: v38SectionType[];
  roadmapOpenSteps: number[];
};

type v38LicenseStatusItem = {
  title: string;
  status: v38CheckoffStatus;
};

type v38CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v38LicenseStatus =
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

type v38SectionType = "PLAN" | "START" | "OPERATE";

type v38ExternalStatus = {
  newsletter?: v38NewsletterResponse;
  userTesting?: v38UserTestingResponse;
};

interface v38NewsletterResponse {
  success?: boolean;
  status: v38NewsletterStatus;
}

interface v38UserTestingResponse {
  success?: boolean;
  status: v38UserTestingStatus;
}

type v38NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v38UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v38FormationData {
  formationFormData: v38FormationFormData;
  formationResponse: v38FormationSubmitResponse | undefined;
  getFilingResponse: v38GetFilingResponse | undefined;
}

interface v38FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v38FormationFormData {
  businessSuffix: v38BusinessSuffix | undefined;
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
  members: v38FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v38PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v38PaymentType = "CC" | "ACH" | undefined;

type v38BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v38FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v38FormationSubmitError[];
};

type v38FormationSubmitError = {
  field: string;
  message: string;
};

type v38GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v38 factories ----------------

import { v36UserData } from "./v36_add_member_to_formation_data";

export interface v37UserData {
  user: v37BusinessUser;
  profileData: v37ProfileData;
  formProgress: v37FormProgress;
  taskProgress: Record<string, v37TaskProgress>;
  licenseData: v37LicenseData | undefined;
  preferences: v37Preferences;
  taxFilingData: v37TaxFilingData;
  formationData: v37FormationData;
  version: number;
}

export const migrate_v36_to_v37 = (v36Data: v36UserData): v37UserData => {
  return {
    ...v36Data,
    profileData: { ...v36Data.profileData, dateOfFormation: undefined },
    version: 37,
  };
};

// ---------------- v37 types ----------------

type v37TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v37FormProgress = "UNSTARTED" | "COMPLETED";

type v37BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v37ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v37ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v37Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  certificationIds: string[];
  existingEmployees: string | undefined;
}

type v37Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v37TaxFilingData = {
  entityIdStatus: v37EntityIdStatus;
  filings: v37TaxFiling[];
};

type v37EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

type v37TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v37NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v37LicenseData = {
  nameAndAddress: v37NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v37LicenseStatus;
  items: v37LicenseStatusItem[];
};

type v37Preferences = {
  roadmapOpenSections: v37SectionType[];
  roadmapOpenSteps: number[];
};

type v37LicenseStatusItem = {
  title: string;
  status: v37CheckoffStatus;
};

type v37CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v37LicenseStatus =
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

type v37SectionType = "PLAN" | "START" | "OPERATE";

type v37ExternalStatus = {
  newsletter?: v37NewsletterResponse;
  userTesting?: v37UserTestingResponse;
};

interface v37NewsletterResponse {
  success?: boolean;
  status: v37NewsletterStatus;
}

interface v37UserTestingResponse {
  success?: boolean;
  status: v37UserTestingStatus;
}

type v37NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v37UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v37FormationData {
  formationFormData: v37FormationFormData;
  formationResponse: v37FormationSubmitResponse | undefined;
  getFilingResponse: v37GetFilingResponse | undefined;
}

interface v37FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v37FormationFormData {
  businessSuffix: v37BusinessSuffix | undefined;
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
  members: v37FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v37PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v37PaymentType = "CC" | "ACH" | undefined;

type v37BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v37FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v37FormationSubmitError[];
};

type v37FormationSubmitError = {
  field: string;
  message: string;
};

type v37GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v37 factories ----------------

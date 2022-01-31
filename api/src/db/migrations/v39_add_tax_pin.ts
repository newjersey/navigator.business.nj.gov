import { v38UserData } from "./v38_swap_certification_for_ownership";

export interface v39UserData {
  user: v39BusinessUser;
  profileData: v39ProfileData;
  formProgress: v39FormProgress;
  taskProgress: Record<string, v39TaskProgress>;
  licenseData: v39LicenseData | undefined;
  preferences: v39Preferences;
  taxFilingData: v39TaxFilingData;
  formationData: v39FormationData;
  version: number;
}

export const migrate_v38_to_v39 = (v38Data: v38UserData): v39UserData => {
  return {
    ...v38Data,
    profileData: { ...v38Data.profileData, taxPin: undefined },
    version: 39,
  };
};

// ---------------- v39 types ----------------

type v39TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v39FormProgress = "UNSTARTED" | "COMPLETED";

type v39BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v39ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v39ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v39Municipality | undefined;
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
}

type v39Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v39TaxFilingData = {
  entityIdStatus: v39EntityIdStatus;
  filings: v39TaxFiling[];
};

type v39EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

type v39TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v39NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v39LicenseData = {
  nameAndAddress: v39NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v39LicenseStatus;
  items: v39LicenseStatusItem[];
};

type v39Preferences = {
  roadmapOpenSections: v39SectionType[];
  roadmapOpenSteps: number[];
};

type v39LicenseStatusItem = {
  title: string;
  status: v39CheckoffStatus;
};

type v39CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v39LicenseStatus =
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

type v39SectionType = "PLAN" | "START" | "OPERATE";

type v39ExternalStatus = {
  newsletter?: v39NewsletterResponse;
  userTesting?: v39UserTestingResponse;
};

interface v39NewsletterResponse {
  success?: boolean;
  status: v39NewsletterStatus;
}

interface v39UserTestingResponse {
  success?: boolean;
  status: v39UserTestingStatus;
}

type v39NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v39UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v39FormationData {
  formationFormData: v39FormationFormData;
  formationResponse: v39FormationSubmitResponse | undefined;
  getFilingResponse: v39GetFilingResponse | undefined;
}

interface v39FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v39FormationFormData {
  businessSuffix: v39BusinessSuffix | undefined;
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
  members: v39FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v39PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v39PaymentType = "CC" | "ACH" | undefined;

type v39BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v39FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v39FormationSubmitError[];
};

type v39FormationSubmitError = {
  field: string;
  message: string;
};

type v39GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v39 factories ----------------

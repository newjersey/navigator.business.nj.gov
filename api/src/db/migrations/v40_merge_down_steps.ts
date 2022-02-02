import { v39UserData } from "./v39_add_tax_pin";

export interface v40UserData {
  user: v40BusinessUser;
  profileData: v40ProfileData;
  formProgress: v40FormProgress;
  taskProgress: Record<string, v40TaskProgress>;
  licenseData: v40LicenseData | undefined;
  preferences: v40Preferences;
  taxFilingData: v40TaxFilingData;
  formationData: v40FormationData;
  version: number;
}

export const migrate_v39_to_v40 = (v39Data: v39UserData): v40UserData => {
  return {
    ...v39Data,
    preferences: {
      ...v39Data.preferences,
      roadmapOpenSteps: [
        ...new Set(
          v39Data.preferences.roadmapOpenSteps.map((value) => (value === 2 ? 1 : value === 5 ? 4 : value))
        ),
      ],
    },
    version: 40,
  };
};

// ---------------- v40 types ----------------

type v40TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v40FormProgress = "UNSTARTED" | "COMPLETED";

type v40BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v40ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
};

interface v40ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v40Municipality | undefined;
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

type v40Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v40TaxFilingData = {
  entityIdStatus: v40EntityIdStatus;
  filings: v40TaxFiling[];
};

type v40EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

type v40TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v40NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v40LicenseData = {
  nameAndAddress: v40NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v40LicenseStatus;
  items: v40LicenseStatusItem[];
};

type v40Preferences = {
  roadmapOpenSections: v40SectionType[];
  roadmapOpenSteps: number[];
};

type v40LicenseStatusItem = {
  title: string;
  status: v40CheckoffStatus;
};

type v40CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v40LicenseStatus =
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

type v40SectionType = "PLAN" | "START" | "OPERATE";

type v40ExternalStatus = {
  newsletter?: v40NewsletterResponse;
  userTesting?: v40UserTestingResponse;
};

interface v40NewsletterResponse {
  success?: boolean;
  status: v40NewsletterStatus;
}

interface v40UserTestingResponse {
  success?: boolean;
  status: v40UserTestingStatus;
}

type v40NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v40UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v40FormationData {
  formationFormData: v40FormationFormData;
  formationResponse: v40FormationSubmitResponse | undefined;
  getFilingResponse: v40GetFilingResponse | undefined;
}

interface v40FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

interface v40FormationFormData {
  businessSuffix: v40BusinessSuffix | undefined;
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
  members: v40FormationMember[];
  signer: string;
  additionalSigners: string[];
  paymentType: v40PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

type v40PaymentType = "CC" | "ACH" | undefined;

type v40BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v40FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v40FormationSubmitError[];
};

type v40FormationSubmitError = {
  field: string;
  message: string;
};

type v40GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v40 factories ----------------

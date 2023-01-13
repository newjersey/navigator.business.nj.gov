import { v88UserData } from "./v88_add_interstate_transport";

export interface v89UserData {
  user: v89BusinessUser;
  profileData: v89ProfileData;
  formProgress: v89FormProgress;
  taskProgress: Record<string, v89TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v89LicenseData | undefined;
  preferences: v89Preferences;
  taxFilingData: v89TaxFilingData;
  formationData: v89FormationData;
  version: number;
}

export const migrate_v88_to_v89 = (v88Data: v88UserData): v89UserData => {
  return {
    ...v88Data,
    taxFilingData: {
      ...v88Data.taxFilingData,
      registered: ["SUCCESS", "PENDING"].includes(v88Data.taxFilingData.state ?? ""),
    },
    version: 89,
  };
};

// ---------------- v89 types ----------------

type v89TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v89FormProgress = "UNSTARTED" | "COMPLETED";
export type v89ABExperience = "ExperienceA" | "ExperienceB";

type v89BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v89ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v89ABExperience;
};

interface v89ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v89BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v89ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v89OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;
type v89CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v89ProfileData {
  businessPersona: v89BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v89Municipality | undefined;
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
  documents: v89ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v89ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  operatingPhase: v89OperatingPhase;
  carService: v89CarServiceType | undefined;
  interstateTransport: boolean;
}

type v89Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v89TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

type v89TaxFilingData = {
  state?: v89TaxFilingState;
  lastUpdatedISO?: string;
  businessName?: string;
  registered: boolean;
  filings: v89TaxFiling[];
};

type v89TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v89NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v89LicenseData = {
  nameAndAddress: v89NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v89LicenseStatus;
  items: v89LicenseStatusItem[];
};

type v89Preferences = {
  roadmapOpenSections: v89SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v89LicenseStatusItem = {
  title: string;
  status: v89CheckoffStatus;
};

type v89CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v89LicenseStatus =
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

type v89SectionType = "PLAN" | "START";

type v89ExternalStatus = {
  newsletter?: v89NewsletterResponse;
  userTesting?: v89UserTestingResponse;
};

interface v89NewsletterResponse {
  success?: boolean;
  status: v89NewsletterStatus;
}

interface v89UserTestingResponse {
  success?: boolean;
  status: v89UserTestingStatus;
}

type v89NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v89UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v89FormationData {
  formationFormData: v89FormationFormData;
  formationResponse: v89FormationSubmitResponse | undefined;
  getFilingResponse: v89GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v89FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v89BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v89Municipality | undefined;
  readonly businessAddressLine1: string;
  readonly businessAddressLine2: string;
  readonly businessAddressState: string;
  readonly businessAddressZipCode: string;
  readonly businessPurpose: string;
  readonly provisions: string[];
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressState: string;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v89FormationAddress[];
  readonly signers: v89FormationAddress[];
  readonly paymentType: v89PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v89FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v89PaymentType = "CC" | "ACH" | undefined;

const llcBusinessSuffix = [
  "LLC",
  "L.L.C.",
  "LTD LIABILITY CO",
  "LTD LIABILITY CO.",
  "LTD LIABILITY COMPANY",
  "LIMITED LIABILITY CO",
  "LIMITED LIABILITY CO.",
  "LIMITED LIABILITY COMPANY",
] as const;

const llpBusinessSuffix = [
  "Limited Liability Partnership",
  "LLP",
  "L.L.P.",
  "Registered Limited Liability Partnership",
  "RLLP",
  "R.L.L.P.",
] as const;

export const corpBusinessSuffix = [
  "Corporation",
  "Incorporated",
  "Company",
  "LTD",
  "CO",
  "CO.",
  "CORP",
  "CORP.",
  "INC",
  "INC.",
] as const;

const AllBusinessSuffixes = [...llcBusinessSuffix, ...llpBusinessSuffix, ...corpBusinessSuffix] as const;

type v89BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v89FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v89FormationSubmitError[];
};

type v89FormationSubmitError = {
  field: string;
  message: string;
};

type v89GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v89 factories ----------------

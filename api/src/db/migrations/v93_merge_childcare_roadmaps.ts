import { v92UserData } from "./v92_splits_profiledata_interface";

export interface v93UserData {
  user: v93BusinessUser;
  profileData: v93ProfileData;
  formProgress: v93FormProgress;
  taskProgress: Record<string, v93TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v93LicenseData | undefined;
  preferences: v93Preferences;
  taxFilingData: v93TaxFilingData;
  formationData: v93FormationData;
  version: number;
}

export const migrate_v92_to_v93 = (v92Data: v92UserData): v93UserData => {
  return {
    ...v92Data,
    profileData: {
      ...v92Data.profileData,
      industryId:
        v92Data.profileData.industryId === "family-daycare" ? "daycare" : v92Data.profileData.industryId,
      isChildcareForSixOrMore: ["family-daycare", "daycare"].includes(v92Data.profileData.industryId ?? "")
        ? v92Data.profileData.industryId === "daycare"
        : undefined
    },
    version: 93
  };
};

// ---------------- v93 types ----------------

type v93TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v93FormProgress = "UNSTARTED" | "COMPLETED";
export type v93ABExperience = "ExperienceA" | "ExperienceB";

type v93BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v93ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v93ABExperience;
};

interface v93ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v93BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v93ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v93OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v93CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v93IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v93CarServiceType | undefined;
  interstateTransport: boolean;
  isChildcareForSixOrMore: boolean | undefined;
}

interface v93ProfileData extends v93IndustrySpecificData {
  businessPersona: v93BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v93Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v93ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v93ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  operatingPhase: v93OperatingPhase;
}

type v93Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v93TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

type v93TaxFilingData = {
  state?: v93TaxFilingState;
  lastUpdatedISO?: string;
  businessName?: string;
  registered: boolean;
  filings: v93TaxFiling[];
};

type v93TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v93NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v93LicenseData = {
  nameAndAddress: v93NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v93LicenseStatus;
  items: v93LicenseStatusItem[];
};

type v93Preferences = {
  roadmapOpenSections: v93SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v93LicenseStatusItem = {
  title: string;
  status: v93CheckoffStatus;
};

type v93CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v93LicenseStatus =
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

const v93SectionNames = ["PLAN", "START"] as const;
type v93SectionType = (typeof v93SectionNames)[number];

type v93ExternalStatus = {
  newsletter?: v93NewsletterResponse;
  userTesting?: v93UserTestingResponse;
};

interface v93NewsletterResponse {
  success?: boolean;
  status: v93NewsletterStatus;
}

interface v93UserTestingResponse {
  success?: boolean;
  status: v93UserTestingStatus;
}

type v93NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v93UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

interface v93FormationData {
  formationFormData: v93FormationFormData;
  formationResponse: v93FormationSubmitResponse | undefined;
  getFilingResponse: v93GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

export interface v93FormationFormData {
  businessName: string;
  businessSuffix: v93BusinessSuffix | undefined;
  businessTotalStock: string;
  businessStartDate: string;
  businessAddressCity: v93Municipality | undefined;
  businessAddressLine1: string;
  businessAddressLine2: string;
  businessAddressState: string;
  businessAddressZipCode: string;
  businessPurpose: string;
  provisions: string[];
  agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  agentNumber: string;
  agentName: string;
  agentEmail: string;
  agentOfficeAddressLine1: string;
  agentOfficeAddressLine2: string;
  agentOfficeAddressCity: string;
  agentOfficeAddressState: string;
  agentOfficeAddressZipCode: string;
  agentUseAccountInfo: boolean;
  agentUseBusinessAddress: boolean;
  members: v93FormationAddress[];
  signers: v93FormationAddress[];
  paymentType: v93PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

export interface v93FormationAddress {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  signature: boolean;
}

type v93PaymentType = "CC" | "ACH" | undefined;

const llcBusinessSuffix = [
  "LLC",
  "L.L.C.",
  "LTD LIABILITY CO",
  "LTD LIABILITY CO.",
  "LTD LIABILITY COMPANY",
  "LIMITED LIABILITY CO",
  "LIMITED LIABILITY CO.",
  "LIMITED LIABILITY COMPANY"
] as const;

const llpBusinessSuffix = [
  "Limited Liability Partnership",
  "LLP",
  "L.L.P.",
  "Registered Limited Liability Partnership",
  "RLLP",
  "R.L.L.P."
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
  "INC."
] as const;

const AllBusinessSuffixes = [...llcBusinessSuffix, ...llpBusinessSuffix, ...corpBusinessSuffix] as const;

type v93BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v93FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v93FormationSubmitError[];
};

type v93FormationSubmitError = {
  field: string;
  message: string;
};

type v93GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

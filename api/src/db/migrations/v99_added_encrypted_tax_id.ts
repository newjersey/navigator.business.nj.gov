import { v98UserData } from "./v98_add_phase_newly_changed";

export interface v99UserData {
  user: v99BusinessUser;
  profileData: v99ProfileData;
  formProgress: v99FormProgress;
  taskProgress: Record<string, v99TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v99LicenseData | undefined;
  preferences: v99Preferences;
  taxFilingData: v99TaxFilingData;
  formationData: v99FormationData;
  version: number;
}

export const migrate_v98_to_v99 = (v98Data: v98UserData): v99UserData => {
  return {
    ...v98Data,
    profileData: {
      ...v98Data.profileData,
      encryptedTaxId: undefined,
    },
    version: 99,
  };
};

// ---------------- v99 types ----------------
type v99TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v99FormProgress = "UNSTARTED" | "COMPLETED";
type v99ABExperience = "ExperienceA" | "ExperienceB";

type v99BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v99ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v99ABExperience;
};

interface v99ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v99BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v99ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v99OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v99CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v99IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v99CarServiceType | undefined;
  interstateTransport: boolean;
  isChildcareForSixOrMore: boolean | undefined;
}

interface v99ProfileData extends v99IndustrySpecificData {
  businessPersona: v99BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v99Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v99ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v99ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  operatingPhase: v99OperatingPhase;
}

type v99Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v99TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v99TaxFilingErrorFields = "Business Name" | "Taxpayer ID";

type v99TaxFilingData = {
  state?: v99TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v99TaxFilingErrorFields;
  businessName?: string;
  filings: v99TaxFiling[];
};

type v99TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v99NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v99LicenseData = {
  nameAndAddress: v99NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v99LicenseStatus;
  items: v99LicenseStatusItem[];
};

type v99Preferences = {
  roadmapOpenSections: v99SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v99LicenseStatusItem = {
  title: string;
  status: v99CheckoffStatus;
};

type v99CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v99LicenseStatus =
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

const v99SectionNames = ["PLAN", "START"] as const;
type v99SectionType = (typeof v99SectionNames)[number];

type v99ExternalStatus = {
  newsletter?: v99NewsletterResponse;
  userTesting?: v99UserTestingResponse;
};

interface v99NewsletterResponse {
  success?: boolean;
  status: v99NewsletterStatus;
}

interface v99UserTestingResponse {
  success?: boolean;
  status: v99UserTestingStatus;
}

type v99NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v99UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v99FormationData {
  formationFormData: v99FormationFormData;
  formationResponse: v99FormationSubmitResponse | undefined;
  getFilingResponse: v99GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v99FormationFormData extends v99FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v99BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string; // YYYY-MM-DD
  readonly businessPurpose: string;
  readonly withdrawals: string;
  readonly combinedInvestment: string;
  readonly dissolution: string;
  readonly canCreateLimitedPartner: boolean | undefined;
  readonly createLimitedPartnerTerms: string;
  readonly canGetDistribution: boolean | undefined;
  readonly getDistributionTerms: string;
  readonly canMakeDistribution: boolean | undefined;
  readonly makeDistributionTerms: string;
  readonly provisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v99Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v99FormationMember[] | undefined;
  readonly incorporators: v99FormationIncorporator[] | undefined;
  readonly signers: v99FormationSigner[] | undefined;
  readonly paymentType: v99PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v99StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v99ForeignGoodStandingFileObject | undefined;
}

type v99ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v99StateObject = {
  shortCode: string;
  name: string;
};

interface v99FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v99StateObject;
  readonly addressMunicipality?: v99Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v99SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v99FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v99SignerTitle;
}

interface v99FormationIncorporator extends v99FormationSigner, v99FormationAddress {}

interface v99FormationMember extends v99FormationAddress {
  readonly name: string;
}

type v99PaymentType = "CC" | "ACH" | undefined;

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

export const lpBusinessSuffix = ["LIMITED PARTNERSHIP", "LP", "L.P."] as const;

const corpBusinessSuffix = [
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

const foreignCorpBusinessSuffix = [...corpBusinessSuffix, "P.C.", "P.A."] as const;

const AllBusinessSuffixes = [
  ...llcBusinessSuffix,
  ...llpBusinessSuffix,
  ...lpBusinessSuffix,
  ...foreignCorpBusinessSuffix,
] as const;

type v99BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v99FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v99FormationSubmitError[];
};

type v99FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v99GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

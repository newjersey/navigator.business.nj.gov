import { v111UserData } from "./v111_add_date_created_and_initial_version";

export interface v112UserData {
  user: v112BusinessUser;
  profileData: v112ProfileData;
  onboardingFormProgress: v112OnboardingFormProgress;
  taskProgress: Record<string, v112TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v112LicenseData | undefined;
  preferences: v112Preferences;
  taxFilingData: v112TaxFilingData;
  formationData: v112FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
  dateCreatedISO: string | undefined;
  versionWhenCreated: number;
}

export const migrate_v111_to_v112 = (v111Data: v111UserData): v112UserData => {
  return {
    ...v111Data,
    formationData: {
      ...v111Data.formationData,
      lastVisitedPageIndex: 0,
    },
    version: 112,
  };
};

// ---------------- v112 types ----------------
type v112TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v112OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v112ABExperience = "ExperienceA" | "ExperienceB";

type v112BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v112ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v112ABExperience;
};

interface v112ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v112BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v112ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v112OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v112CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v112IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v112CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v112ProfileData extends v112IndustrySpecificData {
  businessPersona: v112BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v112Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v112ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v112ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v112OperatingPhase;
}

type v112Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v112TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v112TaxFilingErrorFields = "businessName" | "formFailure";

type v112TaxFilingData = {
  state?: v112TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v112TaxFilingErrorFields;
  businessName?: string;
  filings: v112TaxFiling[];
};

type v112TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v112NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v112LicenseData = {
  nameAndAddress: v112NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v112LicenseStatus;
  items: v112LicenseStatusItem[];
};

type v112Preferences = {
  roadmapOpenSections: v112SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v112LicenseStatusItem = {
  title: string;
  status: v112CheckoffStatus;
};

type v112CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v112LicenseStatus =
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

const v112SectionNames = ["PLAN", "START"] as const;
type v112SectionType = (typeof v112SectionNames)[number];

type v112ExternalStatus = {
  newsletter?: v112NewsletterResponse;
  userTesting?: v112UserTestingResponse;
};

interface v112NewsletterResponse {
  success?: boolean;
  status: v112NewsletterStatus;
}

interface v112UserTestingResponse {
  success?: boolean;
  status: v112UserTestingStatus;
}

type v112NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v112UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v112NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v112NameAvailabilityResponse {
  status: v112NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v112NameAvailability extends v112NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v112FormationData {
  formationFormData: v112FormationFormData;
  businessNameAvailability: v112NameAvailability | undefined;
  formationResponse: v112FormationSubmitResponse | undefined;
  getFilingResponse: v112GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

interface v112FormationFormData extends v112FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v112BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v112Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v112FormationMember[] | undefined;
  readonly incorporators: v112FormationIncorporator[] | undefined;
  readonly signers: v112FormationSigner[] | undefined;
  readonly paymentType: v112PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v112StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v112ForeignGoodStandingFileObject | undefined;
}

type v112ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v112StateObject = {
  shortCode: string;
  name: string;
};

interface v112FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v112StateObject;
  readonly addressMunicipality?: v112Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v112SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v112FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v112SignerTitle;
}

interface v112FormationIncorporator extends v112FormationSigner, v112FormationAddress {}

interface v112FormationMember extends v112FormationAddress {
  readonly name: string;
}

type v112PaymentType = "CC" | "ACH" | undefined;

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

type v112BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v112FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v112FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v112FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v112GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

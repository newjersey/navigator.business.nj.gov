import { v112UserData } from "./v112_add_last_visited_formation_page_to_formation_data";

export interface v113UserData {
  user: v113BusinessUser;
  profileData: v113ProfileData;
  onboardingFormProgress: v113OnboardingFormProgress;
  taskProgress: Record<string, v113TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v113LicenseData | undefined;
  preferences: v113Preferences;
  taxFilingData: v113TaxFilingData;
  formationData: v113FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
  dateCreatedISO: string | undefined;
  versionWhenCreated: number;
}

export const migrate_v112_to_v113 = (v112Data: v112UserData): v113UserData => {
  return {
    ...v112Data,
    taskProgress: {
      ...v112Data.taskProgress,
      "business-structure": v112Data.profileData.legalStructureId ? "COMPLETED" : "NOT_STARTED"
    },
    version: 113
  };
};

// ---------------- v113 types ----------------
type v113TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v113OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v113ABExperience = "ExperienceA" | "ExperienceB";

type v113BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v113ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v113ABExperience;
};

interface v113ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v113BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v113ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v113OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v113CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v113IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v113CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v113ProfileData extends v113IndustrySpecificData {
  businessPersona: v113BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v113Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v113ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v113ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v113OperatingPhase;
}

type v113Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v113TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v113TaxFilingErrorFields = "businessName" | "formFailure";

type v113TaxFilingData = {
  state?: v113TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v113TaxFilingErrorFields;
  businessName?: string;
  filings: v113TaxFiling[];
};

type v113TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v113NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v113LicenseData = {
  nameAndAddress: v113NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v113LicenseStatus;
  items: v113LicenseStatusItem[];
};

type v113Preferences = {
  roadmapOpenSections: v113SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v113LicenseStatusItem = {
  title: string;
  status: v113CheckoffStatus;
};

type v113CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v113LicenseStatus =
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

const v113SectionNames = ["PLAN", "START"] as const;
type v113SectionType = (typeof v113SectionNames)[number];

type v113ExternalStatus = {
  newsletter?: v113NewsletterResponse;
  userTesting?: v113UserTestingResponse;
};

interface v113NewsletterResponse {
  success?: boolean;
  status: v113NewsletterStatus;
}

interface v113UserTestingResponse {
  success?: boolean;
  status: v113UserTestingStatus;
}

type v113NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v113UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

type v113NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v113NameAvailabilityResponse {
  status: v113NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v113NameAvailability extends v113NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v113FormationData {
  formationFormData: v113FormationFormData;
  businessNameAvailability: v113NameAvailability | undefined;
  formationResponse: v113FormationSubmitResponse | undefined;
  getFilingResponse: v113GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

interface v113FormationFormData extends v113FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v113BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v113Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v113FormationMember[] | undefined;
  readonly incorporators: v113FormationIncorporator[] | undefined;
  readonly signers: v113FormationSigner[] | undefined;
  readonly paymentType: v113PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v113StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v113ForeignGoodStandingFileObject | undefined;
}

type v113ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v113StateObject = {
  shortCode: string;
  name: string;
};

interface v113FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v113StateObject;
  readonly addressMunicipality?: v113Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v113SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v113FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v113SignerTitle;
}

interface v113FormationIncorporator extends v113FormationSigner, v113FormationAddress {}

interface v113FormationMember extends v113FormationAddress {
  readonly name: string;
}

type v113PaymentType = "CC" | "ACH" | undefined;

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
  "INC."
] as const;

const foreignCorpBusinessSuffix = [...corpBusinessSuffix, "P.C.", "P.A."] as const;

const AllBusinessSuffixes = [
  ...llcBusinessSuffix,
  ...llpBusinessSuffix,
  ...lpBusinessSuffix,
  ...foreignCorpBusinessSuffix
] as const;

type v113BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v113FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v113FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v113FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v113GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

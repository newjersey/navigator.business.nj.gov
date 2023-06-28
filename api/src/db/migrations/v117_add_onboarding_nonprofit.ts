import { v116UserData } from "./v116_add_dba_business_name_availability";

export interface v117UserData {
  user: v117BusinessUser;
  profileData: v117ProfileData;
  onboardingFormProgress: v117OnboardingFormProgress;
  taskProgress: Record<string, v117TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v117LicenseData | undefined;
  preferences: v117Preferences;
  taxFilingData: v117TaxFilingData;
  formationData: v117FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
  dateCreatedISO: string | undefined;
  versionWhenCreated: number;
}

export const migrate_v116_to_v117 = (v116Data: v116UserData): v117UserData => {
  return {
    ...v116Data,
    profileData: {
      ...v116Data.profileData,
      isNonprofitOnboardingRadio: false,
    },
    version: 117,
  };
};

// ---------------- v117 types ----------------
type v117TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v117OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v117ABExperience = "ExperienceA" | "ExperienceB";

type v117BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v117ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v117ABExperience;
};

interface v117ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v117BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v117ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v117OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v117CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v117IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v117CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v117ProfileData extends v117IndustrySpecificData {
  businessPersona: v117BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v117Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v117ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v117ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v117OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v117Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v117TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v117TaxFilingErrorFields = "businessName" | "formFailure";

type v117TaxFilingData = {
  state?: v117TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v117TaxFilingErrorFields;
  businessName?: string;
  filings: v117TaxFiling[];
};

type v117TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v117NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v117LicenseData = {
  nameAndAddress: v117NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v117LicenseStatus;
  items: v117LicenseStatusItem[];
};

type v117Preferences = {
  roadmapOpenSections: v117SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v117LicenseStatusItem = {
  title: string;
  status: v117CheckoffStatus;
};

type v117CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v117LicenseStatus =
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

const v117SectionNames = ["PLAN", "START"] as const;
type v117SectionType = (typeof v117SectionNames)[number];

type v117ExternalStatus = {
  newsletter?: v117NewsletterResponse;
  userTesting?: v117UserTestingResponse;
};

interface v117NewsletterResponse {
  success?: boolean;
  status: v117NewsletterStatus;
}

interface v117UserTestingResponse {
  success?: boolean;
  status: v117UserTestingStatus;
}

type v117NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v117UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v117NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v117NameAvailabilityResponse {
  status: v117NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v117NameAvailability extends v117NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v117FormationData {
  formationFormData: v117FormationFormData;
  businessNameAvailability: v117NameAvailability | undefined;
  dbaBusinessNameAvailability: v117NameAvailability | undefined;
  formationResponse: v117FormationSubmitResponse | undefined;
  getFilingResponse: v117GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

interface v117FormationFormData extends v117FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v117BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v117Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v117FormationMember[] | undefined;
  readonly incorporators: v117FormationIncorporator[] | undefined;
  readonly signers: v117FormationSigner[] | undefined;
  readonly paymentType: v117PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v117StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v117ForeignGoodStandingFileObject | undefined;
}

type v117ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v117StateObject = {
  shortCode: string;
  name: string;
};

interface v117FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v117StateObject;
  readonly addressMunicipality?: v117Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v117SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v117FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v117SignerTitle;
}

interface v117FormationIncorporator extends v117FormationSigner, v117FormationAddress {}

interface v117FormationMember extends v117FormationAddress {
  readonly name: string;
}

type v117PaymentType = "CC" | "ACH" | undefined;

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

type v117BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v117FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v117FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v117FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v117GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

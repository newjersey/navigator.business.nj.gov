import { v118UserData } from "@db/migrations/v118_set_operating_phase_remote_seller_worker";
import { v4 as uuidv4 } from "uuid";

export interface v119UserData {
  user: v119BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v119Business>;
  currentBusinessId: string;
}

export interface v119Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v119ProfileData;
  onboardingFormProgress: v119OnboardingFormProgress;
  taskProgress: Record<string, v119TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v119LicenseData | undefined;
  preferences: v119Preferences;
  taxFilingData: v119TaxFilingData;
  formationData: v119FormationData;
}

export const migrate_v118_to_v119 = (v118Data: v118UserData): v119UserData => {
  const businessId = uuidv4();
  return {
    user: v118Data.user,
    dateCreatedISO: v118Data.dateCreatedISO || new Date(Date.now()).toISOString(),
    lastUpdatedISO: v118Data.lastUpdatedISO || new Date(Date.now()).toISOString(),
    versionWhenCreated: v118Data.versionWhenCreated,
    currentBusinessId: businessId,
    businesses: {
      [businessId]: {
        id: businessId,
        dateCreatedISO: v118Data.dateCreatedISO || new Date(Date.now()).toISOString(),
        lastUpdatedISO: v118Data.lastUpdatedISO || new Date(Date.now()).toISOString(),
        profileData: v118Data.profileData,
        onboardingFormProgress: v118Data.onboardingFormProgress,
        taskProgress: v118Data.taskProgress,
        taskItemChecklist: v118Data.taskItemChecklist,
        licenseData: v118Data.licenseData,
        preferences: v118Data.preferences,
        taxFilingData: v118Data.taxFilingData,
        formationData: v118Data.formationData,
      },
    },
    version: 119,
  };
};

// ---------------- v119 types ----------------
type v119TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v119OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v119ABExperience = "ExperienceA" | "ExperienceB";

type v119BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v119ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v119ABExperience;
};

interface v119ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v119BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v119ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v119OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v119CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v119IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v119CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v119ProfileData extends v119IndustrySpecificData {
  businessPersona: v119BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v119Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v119ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v119ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v119OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v119Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v119TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v119TaxFilingErrorFields = "businessName" | "formFailure";

type v119TaxFilingData = {
  state?: v119TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v119TaxFilingErrorFields;
  businessName?: string;
  filings: v119TaxFiling[];
};

export type v119TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v119NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v119LicenseData = {
  nameAndAddress: v119NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v119LicenseStatus;
  items: v119LicenseStatusItem[];
};

type v119Preferences = {
  roadmapOpenSections: v119SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v119LicenseStatusItem = {
  title: string;
  status: v119CheckoffStatus;
};

type v119CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v119LicenseStatus =
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

const v119SectionNames = ["PLAN", "START"] as const;
type v119SectionType = (typeof v119SectionNames)[number];

type v119ExternalStatus = {
  newsletter?: v119NewsletterResponse;
  userTesting?: v119UserTestingResponse;
};

interface v119NewsletterResponse {
  success?: boolean;
  status: v119NewsletterStatus;
}

interface v119UserTestingResponse {
  success?: boolean;
  status: v119UserTestingStatus;
}

type v119NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v119UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v119NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v119NameAvailabilityResponse {
  status: v119NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v119NameAvailability extends v119NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v119FormationData {
  formationFormData: v119FormationFormData;
  businessNameAvailability: v119NameAvailability | undefined;
  dbaBusinessNameAvailability: v119NameAvailability | undefined;
  formationResponse: v119FormationSubmitResponse | undefined;
  getFilingResponse: v119GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

interface v119FormationFormData extends v119FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v119BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v119Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v119FormationMember[] | undefined;
  readonly incorporators: v119FormationIncorporator[] | undefined;
  readonly signers: v119FormationSigner[] | undefined;
  readonly paymentType: v119PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v119StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v119ForeignGoodStandingFileObject | undefined;
}

type v119ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v119StateObject = {
  shortCode: string;
  name: string;
};

interface v119FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v119StateObject;
  readonly addressMunicipality?: v119Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v119SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v119FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v119SignerTitle;
}

interface v119FormationIncorporator extends v119FormationSigner, v119FormationAddress {}

interface v119FormationMember extends v119FormationAddress {
  readonly name: string;
}

type v119PaymentType = "CC" | "ACH" | undefined;

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

type v119BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v119FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v119FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v119FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v119GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

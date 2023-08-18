import { v117UserData } from "./v117_add_onboarding_nonprofit";

export interface v118UserData {
  user: v118BusinessUser;
  profileData: v118ProfileData;
  onboardingFormProgress: v118OnboardingFormProgress;
  taskProgress: Record<string, v118TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v118LicenseData | undefined;
  preferences: v118Preferences;
  taxFilingData: v118TaxFilingData;
  formationData: v118FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
  dateCreatedISO: string | undefined;
  versionWhenCreated: number;
}

export const migrate_v117_to_v118 = (v117Data: v117UserData): v118UserData => {
  const isRemoteSellerWorker =
    v117Data.profileData.businessPersona === "FOREIGN" &&
    (v117Data.profileData.foreignBusinessType === "REMOTE_SELLER" ||
      v117Data.profileData.foreignBusinessType === "REMOTE_WORKER");
  const isNeedsBusinessStructure = v117Data.profileData.operatingPhase === "NEEDS_BUSINESS_STRUCTURE";

  return {
    ...v117Data,
    profileData: {
      ...v117Data.profileData,
      operatingPhase:
        isRemoteSellerWorker && isNeedsBusinessStructure
          ? "NEEDS_TO_FORM"
          : v117Data.profileData.operatingPhase
    },
    version: 118
  };
};

// ---------------- v118 types ----------------
type v118TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v118OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v118ABExperience = "ExperienceA" | "ExperienceB";

type v118BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v118ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v118ABExperience;
};

interface v118ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v118BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v118ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v118OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v118CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v118IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v118CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v118ProfileData extends v118IndustrySpecificData {
  businessPersona: v118BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v118Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v118ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v118ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v118OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v118Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v118TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v118TaxFilingErrorFields = "businessName" | "formFailure";

type v118TaxFilingData = {
  state?: v118TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v118TaxFilingErrorFields;
  businessName?: string;
  filings: v118TaxFiling[];
};

type v118TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v118NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v118LicenseData = {
  nameAndAddress: v118NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v118LicenseStatus;
  items: v118LicenseStatusItem[];
};

type v118Preferences = {
  roadmapOpenSections: v118SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v118LicenseStatusItem = {
  title: string;
  status: v118CheckoffStatus;
};

type v118CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v118LicenseStatus =
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

const v118SectionNames = ["PLAN", "START"] as const;
type v118SectionType = (typeof v118SectionNames)[number];

type v118ExternalStatus = {
  newsletter?: v118NewsletterResponse;
  userTesting?: v118UserTestingResponse;
};

interface v118NewsletterResponse {
  success?: boolean;
  status: v118NewsletterStatus;
}

interface v118UserTestingResponse {
  success?: boolean;
  status: v118UserTestingStatus;
}

type v118NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v118UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

type v118NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v118NameAvailabilityResponse {
  status: v118NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v118NameAvailability extends v118NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v118FormationData {
  formationFormData: v118FormationFormData;
  businessNameAvailability: v118NameAvailability | undefined;
  dbaBusinessNameAvailability: v118NameAvailability | undefined;
  formationResponse: v118FormationSubmitResponse | undefined;
  getFilingResponse: v118GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

interface v118FormationFormData extends v118FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v118BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v118Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v118FormationMember[] | undefined;
  readonly incorporators: v118FormationIncorporator[] | undefined;
  readonly signers: v118FormationSigner[] | undefined;
  readonly paymentType: v118PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v118StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v118ForeignGoodStandingFileObject | undefined;
}

type v118ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v118StateObject = {
  shortCode: string;
  name: string;
};

interface v118FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v118StateObject;
  readonly addressMunicipality?: v118Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v118SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v118FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v118SignerTitle;
}

interface v118FormationIncorporator extends v118FormationSigner, v118FormationAddress {}

interface v118FormationMember extends v118FormationAddress {
  readonly name: string;
}

type v118PaymentType = "CC" | "ACH" | undefined;

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

type v118BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v118FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v118FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v118FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v118GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

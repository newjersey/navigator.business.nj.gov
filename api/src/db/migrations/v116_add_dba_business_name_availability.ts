import { v115UserData } from "./v115_rename_tax_filings";

export interface v116UserData {
  user: v116BusinessUser;
  profileData: v116ProfileData;
  onboardingFormProgress: v116OnboardingFormProgress;
  taskProgress: Record<string, v116TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v116LicenseData | undefined;
  preferences: v116Preferences;
  taxFilingData: v116TaxFilingData;
  formationData: v116FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
  dateCreatedISO: string | undefined;
  versionWhenCreated: number;
}

export const migrate_v115_to_v116 = (v115Data: v115UserData): v116UserData => {
  return {
    ...v115Data,
    formationData: {
      ...v115Data.formationData,
      dbaBusinessNameAvailability: undefined,
    },
    version: 116,
  };
};

// ---------------- v116 types ----------------
type v116TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v116OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v116ABExperience = "ExperienceA" | "ExperienceB";

type v116BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v116ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v116ABExperience;
};

interface v116ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v116BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v116ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v116OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v116CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v116IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v116CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v116ProfileData extends v116IndustrySpecificData {
  businessPersona: v116BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v116Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v116ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v116ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v116OperatingPhase;
}

type v116Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v116TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v116TaxFilingErrorFields = "businessName" | "formFailure";

type v116TaxFilingData = {
  state?: v116TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v116TaxFilingErrorFields;
  businessName?: string;
  filings: v116TaxFiling[];
};

type v116TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v116NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v116LicenseData = {
  nameAndAddress: v116NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v116LicenseStatus;
  items: v116LicenseStatusItem[];
};

type v116Preferences = {
  roadmapOpenSections: v116SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v116LicenseStatusItem = {
  title: string;
  status: v116CheckoffStatus;
};

type v116CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v116LicenseStatus =
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

const v116SectionNames = ["PLAN", "START"] as const;
type v116SectionType = (typeof v116SectionNames)[number];

type v116ExternalStatus = {
  newsletter?: v116NewsletterResponse;
  userTesting?: v116UserTestingResponse;
};

interface v116NewsletterResponse {
  success?: boolean;
  status: v116NewsletterStatus;
}

interface v116UserTestingResponse {
  success?: boolean;
  status: v116UserTestingStatus;
}

type v116NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v116UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v116NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v116NameAvailabilityResponse {
  status: v116NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v116NameAvailability extends v116NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v116FormationData {
  formationFormData: v116FormationFormData;
  businessNameAvailability: v116NameAvailability | undefined;
  dbaBusinessNameAvailability: v116NameAvailability | undefined;
  formationResponse: v116FormationSubmitResponse | undefined;
  getFilingResponse: v116GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

interface v116FormationFormData extends v116FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v116BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v116Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v116FormationMember[] | undefined;
  readonly incorporators: v116FormationIncorporator[] | undefined;
  readonly signers: v116FormationSigner[] | undefined;
  readonly paymentType: v116PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v116StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v116ForeignGoodStandingFileObject | undefined;
}

type v116ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v116StateObject = {
  shortCode: string;
  name: string;
};

interface v116FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v116StateObject;
  readonly addressMunicipality?: v116Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v116SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v116FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v116SignerTitle;
}

interface v116FormationIncorporator extends v116FormationSigner, v116FormationAddress {}

interface v116FormationMember extends v116FormationAddress {
  readonly name: string;
}

type v116PaymentType = "CC" | "ACH" | undefined;

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

type v116BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v116FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v116FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v116FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v116GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

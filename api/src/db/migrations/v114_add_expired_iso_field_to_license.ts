import { v113UserData } from "./v113_add_business_structure_task_completion";

export interface v114UserData {
  user: v114BusinessUser;
  profileData: v114ProfileData;
  onboardingFormProgress: v114OnboardingFormProgress;
  taskProgress: Record<string, v114TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v114LicenseData | undefined;
  preferences: v114Preferences;
  taxFilingData: v114TaxFilingData;
  formationData: v114FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
  dateCreatedISO: string | undefined;
  versionWhenCreated: number;
}

export const migrate_v113_to_v114 = (v113Data: v113UserData): v114UserData => {
  return {
    ...v113Data,
    version: 114
  };
};

// ---------------- v114 types ----------------
type v114TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v114OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v114ABExperience = "ExperienceA" | "ExperienceB";

type v114BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v114ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v114ABExperience;
};

interface v114ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v114BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v114ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v114OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v114CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v114IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v114CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v114ProfileData extends v114IndustrySpecificData {
  businessPersona: v114BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v114Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v114ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v114ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v114OperatingPhase;
}

type v114Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v114TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v114TaxFilingErrorFields = "businessName" | "formFailure";

type v114TaxFilingData = {
  state?: v114TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v114TaxFilingErrorFields;
  businessName?: string;
  filings: v114TaxFiling[];
};

type v114TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v114NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v114LicenseData = {
  nameAndAddress: v114NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  expirationISO?: string;
  status: v114LicenseStatus;
  items: v114LicenseStatusItem[];
};

type v114Preferences = {
  roadmapOpenSections: v114SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v114LicenseStatusItem = {
  title: string;
  status: v114CheckoffStatus;
};

type v114CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v114LicenseStatus =
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

const v114SectionNames = ["PLAN", "START"] as const;
type v114SectionType = (typeof v114SectionNames)[number];

type v114ExternalStatus = {
  newsletter?: v114NewsletterResponse;
  userTesting?: v114UserTestingResponse;
};

interface v114NewsletterResponse {
  success?: boolean;
  status: v114NewsletterStatus;
}

interface v114UserTestingResponse {
  success?: boolean;
  status: v114UserTestingStatus;
}

type v114NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v114UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING"
] as const;

type v114NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v114NameAvailabilityResponse {
  status: v114NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v114NameAvailability extends v114NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v114FormationData {
  formationFormData: v114FormationFormData;
  businessNameAvailability: v114NameAvailability | undefined;
  formationResponse: v114FormationSubmitResponse | undefined;
  getFilingResponse: v114GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

interface v114FormationFormData extends v114FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v114BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v114Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v114FormationMember[] | undefined;
  readonly incorporators: v114FormationIncorporator[] | undefined;
  readonly signers: v114FormationSigner[] | undefined;
  readonly paymentType: v114PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v114StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v114ForeignGoodStandingFileObject | undefined;
}

type v114ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v114StateObject = {
  shortCode: string;
  name: string;
};

interface v114FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v114StateObject;
  readonly addressMunicipality?: v114Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v114SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v114FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v114SignerTitle;
}

interface v114FormationIncorporator extends v114FormationSigner, v114FormationAddress {}

interface v114FormationMember extends v114FormationAddress {
  readonly name: string;
}

type v114PaymentType = "CC" | "ACH" | undefined;

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

type v114BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v114FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v114FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v114FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v114GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

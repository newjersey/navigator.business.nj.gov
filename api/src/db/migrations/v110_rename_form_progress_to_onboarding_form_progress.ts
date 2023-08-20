import { v109UserData } from "./v109_add_business_name_search_timestamp";

export interface v110UserData {
  user: v110BusinessUser;
  profileData: v110ProfileData;
  onboardingFormProgress: v110OnboardingFormProgress;
  taskProgress: Record<string, v110TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v110LicenseData | undefined;
  preferences: v110Preferences;
  taxFilingData: v110TaxFilingData;
  formationData: v110FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
}

export const migrate_v109_to_v110 = (v109Data: v109UserData): v110UserData => {
  return {
    ...v109Data,
    onboardingFormProgress: v109Data.formProgress,
    version: 110,
  };
};

// ---------------- v110 types ----------------
type v110TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v110OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v110ABExperience = "ExperienceA" | "ExperienceB";

type v110BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v110ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v110ABExperience;
};

interface v110ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v110BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v110ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v110OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v110CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v110IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v110CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v110ProfileData extends v110IndustrySpecificData {
  businessPersona: v110BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v110Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v110ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v110ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v110OperatingPhase;
}

type v110Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v110TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v110TaxFilingErrorFields = "businessName" | "formFailure";

type v110TaxFilingData = {
  state?: v110TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v110TaxFilingErrorFields;
  businessName?: string;
  filings: v110TaxFiling[];
};

type v110TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v110NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v110LicenseData = {
  nameAndAddress: v110NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v110LicenseStatus;
  items: v110LicenseStatusItem[];
};

type v110Preferences = {
  roadmapOpenSections: v110SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v110LicenseStatusItem = {
  title: string;
  status: v110CheckoffStatus;
};

type v110CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v110LicenseStatus =
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

const v110SectionNames = ["PLAN", "START"] as const;
type v110SectionType = (typeof v110SectionNames)[number];

type v110ExternalStatus = {
  newsletter?: v110NewsletterResponse;
  userTesting?: v110UserTestingResponse;
};

interface v110NewsletterResponse {
  success?: boolean;
  status: v110NewsletterStatus;
}

interface v110UserTestingResponse {
  success?: boolean;
  status: v110UserTestingStatus;
}

type v110NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v110UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v110NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v110NameAvailabilityResponse {
  status: v110NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v110NameAvailability extends v110NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v110FormationData {
  formationFormData: v110FormationFormData;
  businessNameAvailability: v110NameAvailability | undefined;
  formationResponse: v110FormationSubmitResponse | undefined;
  getFilingResponse: v110GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v110FormationFormData extends v110FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v110BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v110Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v110FormationMember[] | undefined;
  readonly incorporators: v110FormationIncorporator[] | undefined;
  readonly signers: v110FormationSigner[] | undefined;
  readonly paymentType: v110PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v110StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v110ForeignGoodStandingFileObject | undefined;
}

type v110ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v110StateObject = {
  shortCode: string;
  name: string;
};

interface v110FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v110StateObject;
  readonly addressMunicipality?: v110Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v110SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v110FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v110SignerTitle;
}

interface v110FormationIncorporator extends v110FormationSigner, v110FormationAddress {}

interface v110FormationMember extends v110FormationAddress {
  readonly name: string;
}

type v110PaymentType = "CC" | "ACH" | undefined;

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

type v110BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v110FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v110FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v110FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v110GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

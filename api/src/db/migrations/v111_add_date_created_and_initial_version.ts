import { v110UserData } from "@db/migrations/v110_rename_form_progress_to_onboarding_form_progress";

export interface v111UserData {
  user: v111BusinessUser;
  profileData: v111ProfileData;
  onboardingFormProgress: v111OnboardingFormProgress;
  taskProgress: Record<string, v111TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v111LicenseData | undefined;
  preferences: v111Preferences;
  taxFilingData: v111TaxFilingData;
  formationData: v111FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
  dateCreatedISO: string | undefined;
  versionWhenCreated: number;
}

export const migrate_v110_to_v111 = (v110Data: v110UserData): v111UserData => {
  return {
    ...v110Data,
    dateCreatedISO: undefined,
    versionWhenCreated: -1,
    version: 111,
  };
};

// ---------------- v111 types ----------------
type v111TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v111OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v111ABExperience = "ExperienceA" | "ExperienceB";

type v111BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v111ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v111ABExperience;
};

interface v111ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v111BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v111ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v111OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v111CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v111IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v111CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v111ProfileData extends v111IndustrySpecificData {
  businessPersona: v111BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v111Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v111ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v111ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v111OperatingPhase;
}

type v111Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v111TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v111TaxFilingErrorFields = "businessName" | "formFailure";

type v111TaxFilingData = {
  state?: v111TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v111TaxFilingErrorFields;
  businessName?: string;
  filings: v111TaxFiling[];
};

type v111TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v111NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v111LicenseData = {
  nameAndAddress: v111NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v111LicenseStatus;
  items: v111LicenseStatusItem[];
};

type v111Preferences = {
  roadmapOpenSections: v111SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v111LicenseStatusItem = {
  title: string;
  status: v111CheckoffStatus;
};

type v111CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v111LicenseStatus =
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

const v111SectionNames = ["PLAN", "START"] as const;
type v111SectionType = (typeof v111SectionNames)[number];

type v111ExternalStatus = {
  newsletter?: v111NewsletterResponse;
  userTesting?: v111UserTestingResponse;
};

interface v111NewsletterResponse {
  success?: boolean;
  status: v111NewsletterStatus;
}

interface v111UserTestingResponse {
  success?: boolean;
  status: v111UserTestingStatus;
}

type v111NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v111UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v111NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v111NameAvailabilityResponse {
  status: v111NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v111NameAvailability extends v111NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v111FormationData {
  formationFormData: v111FormationFormData;
  businessNameAvailability: v111NameAvailability | undefined;
  formationResponse: v111FormationSubmitResponse | undefined;
  getFilingResponse: v111GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v111FormationFormData extends v111FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v111BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v111Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v111FormationMember[] | undefined;
  readonly incorporators: v111FormationIncorporator[] | undefined;
  readonly signers: v111FormationSigner[] | undefined;
  readonly paymentType: v111PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v111StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v111ForeignGoodStandingFileObject | undefined;
}

type v111ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v111StateObject = {
  shortCode: string;
  name: string;
};

interface v111FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v111StateObject;
  readonly addressMunicipality?: v111Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v111SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v111FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v111SignerTitle;
}

interface v111FormationIncorporator extends v111FormationSigner, v111FormationAddress {}

interface v111FormationMember extends v111FormationAddress {
  readonly name: string;
}

type v111PaymentType = "CC" | "ACH" | undefined;

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

type v111BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v111FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v111FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v111FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v111GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

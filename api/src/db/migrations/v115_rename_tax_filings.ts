import { v114UserData } from "@db/migrations/v114_add_expired_iso_field_to_license";

export interface v115UserData {
  user: v115BusinessUser;
  profileData: v115ProfileData;
  onboardingFormProgress: v115OnboardingFormProgress;
  taskProgress: Record<string, v115TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v115LicenseData | undefined;
  preferences: v115Preferences;
  taxFilingData: v115TaxFilingData;
  formationData: v115FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
  dateCreatedISO: string | undefined;
  versionWhenCreated: number;
}

export const migrate_v114_to_v115 = (v114Data: v114UserData): v115UserData => {
  return {
    ...v114Data,
    taxFilingData: {
      ...v114Data.taxFilingData,
      filings: v114Data.taxFilingData.filings.map((v114TaxFiling) => ({
        ...v114TaxFiling,
        calendarEventType: "TAX-FILING",
      })),
    },
    version: 115,
  };
};

// ---------------- v115 types ----------------
type v115TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v115OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v115ABExperience = "ExperienceA" | "ExperienceB";

type v115BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v115ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v115ABExperience;
};

interface v115ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v115BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v115ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v115OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v115CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v115IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v115CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v115ProfileData extends v115IndustrySpecificData {
  businessPersona: v115BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v115Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v115ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v115ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v115OperatingPhase;
}

type v115Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v115TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v115TaxFilingErrorFields = "businessName" | "formFailure";

type v115TaxFilingData = {
  state?: v115TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v115TaxFilingErrorFields;
  businessName?: string;
  filings: v115TaxFilingCalendarEvent[];
};

type v115CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

interface v115TaxFilingCalendarEvent extends v115CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v115NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v115LicenseData = {
  nameAndAddress: v115NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  expirationISO?: string;
  status: v115LicenseStatus;
  items: v115LicenseStatusItem[];
};

type v115Preferences = {
  roadmapOpenSections: v115SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v115LicenseStatusItem = {
  title: string;
  status: v115CheckoffStatus;
};

type v115CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v115LicenseStatus =
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

const v115SectionNames = ["PLAN", "START"] as const;
type v115SectionType = (typeof v115SectionNames)[number];

type v115ExternalStatus = {
  newsletter?: v115NewsletterResponse;
  userTesting?: v115UserTestingResponse;
};

interface v115NewsletterResponse {
  success?: boolean;
  status: v115NewsletterStatus;
}

interface v115UserTestingResponse {
  success?: boolean;
  status: v115UserTestingStatus;
}

type v115NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v115UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v115NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v115NameAvailabilityResponse {
  status: v115NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v115NameAvailability extends v115NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v115FormationData {
  formationFormData: v115FormationFormData;
  businessNameAvailability: v115NameAvailability | undefined;
  formationResponse: v115FormationSubmitResponse | undefined;
  getFilingResponse: v115GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

interface v115FormationFormData extends v115FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v115BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v115Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v115FormationMember[] | undefined;
  readonly incorporators: v115FormationIncorporator[] | undefined;
  readonly signers: v115FormationSigner[] | undefined;
  readonly paymentType: v115PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v115StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v115ForeignGoodStandingFileObject | undefined;
}

type v115ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v115StateObject = {
  shortCode: string;
  name: string;
};

interface v115FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v115StateObject;
  readonly addressMunicipality?: v115Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v115SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v115FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v115SignerTitle;
}

interface v115FormationIncorporator extends v115FormationSigner, v115FormationAddress {}

interface v115FormationMember extends v115FormationAddress {
  readonly name: string;
}

type v115PaymentType = "CC" | "ACH" | undefined;

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

type v115BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v115FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v115FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v115FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v115GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

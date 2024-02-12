import {
  v128Business,
  v128UserData,
} from "@db/migrations/v128_merge_needs_to_register_and_formed_and_registered";

interface v129ProfileData extends v129IndustrySpecificData {
  businessPersona: v129BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v129Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v129ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v129ForeignBusinessTypeId[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v129OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
  elevatorOwningBusiness: boolean | undefined;
}

export const migrate_v128_to_v129 = (v128Data: v128UserData): v129UserData => {
  return {
    ...v128Data,
    businesses: Object.fromEntries(
      Object.values(v128Data.businesses)
        .map((business) => migrate_v128Business_to_v129Business(business))
        .map((currBusiness) => [currBusiness.id, currBusiness])
    ),
    version: 129,
  };
};

const migrate_v128Business_to_v129Business = (business: v128Business): v129Business => {
  return {
    ...business,
    profileData: {
      ...business.profileData,
      elevatorOwningBusiness: undefined,
    },
  };
};

// ---------------- v129 types ----------------
type v129TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v129OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v129ABExperience = "ExperienceA" | "ExperienceB";

export interface v129UserData {
  user: v129BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v128Business>;
  currentBusinessId: string;
}

export interface v129Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v129ProfileData;
  onboardingFormProgress: v129OnboardingFormProgress;
  taskProgress: Record<string, v129TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v129LicenseData | undefined;
  preferences: v129Preferences;
  taxFilingData: v129TaxFilingData;
  formationData: v129FormationData;
}

type v129BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v129ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v129ABExperience;
};

interface v129ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v129BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v129OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

type v129CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v129IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v129CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

type v129ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v129Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v129TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v129TaxFilingErrorFields = "businessName" | "formFailure";

type v129TaxFilingData = {
  state?: v129TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v129TaxFilingErrorFields;
  businessName?: string;
  filings: v129TaxFilingCalendarEvent[];
};

export type v129CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v129TaxFilingCalendarEvent extends v129CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v129NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v129LicenseData = {
  nameAndAddress: v129NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v129LicenseStatus;
  items: v129LicenseStatusItem[];
};

type v129Preferences = {
  roadmapOpenSections: v129SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v129LicenseStatusItem = {
  title: string;
  status: v129CheckoffStatus;
};

type v129CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v129LicenseStatus =
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

const v129SectionNames = ["PLAN", "START"] as const;
type v129SectionType = (typeof v129SectionNames)[number];

type v129ExternalStatus = {
  newsletter?: v129NewsletterResponse;
  userTesting?: v129UserTestingResponse;
};

interface v129NewsletterResponse {
  success?: boolean;
  status: v129NewsletterStatus;
}

interface v129UserTestingResponse {
  success?: boolean;
  status: v129UserTestingStatus;
}

type v129NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v129UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v129NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v129NameAvailabilityResponse {
  status: v129NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v129NameAvailability extends v129NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v129FormationData {
  formationFormData: v129FormationFormData;
  businessNameAvailability: v129NameAvailability | undefined;
  dbaBusinessNameAvailability: v129NameAvailability | undefined;
  formationResponse: v129FormationSubmitResponse | undefined;
  getFilingResponse: v129GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v129InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v129FormationFormData extends v129FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v129BusinessSuffix | undefined;
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
  readonly hasNonprofitBoardMembers: boolean | undefined;
  readonly nonprofitBoardMemberQualificationsSpecified: v129InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v129InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v129InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v129InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v129Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v129FormationMember[] | undefined;
  readonly incorporators: v129FormationIncorporator[] | undefined;
  readonly signers: v129FormationSigner[] | undefined;
  readonly paymentType: v129PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v129StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v129ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v129ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v129StateObject = {
  shortCode: string;
  name: string;
};

interface v129FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v129StateObject;
  readonly addressMunicipality?: v129Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v129FormationBusinessLocationType | undefined;
}

type v129FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v129SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v129FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v129SignerTitle;
}

interface v129FormationIncorporator extends v129FormationSigner, v129FormationAddress {}

interface v129FormationMember extends v129FormationAddress {
  readonly name: string;
}

type v129PaymentType = "CC" | "ACH" | undefined;

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

export const nonprofitBusinessSuffix = [
  "A NJ NONPROFIT CORPORATION",
  "CORPORATION",
  "INCORPORATED",
  "CORP",
  "CORP.",
  "INC",
  "INC.",
] as const;

const foreignCorpBusinessSuffix = [...corpBusinessSuffix, "P.C.", "P.A."] as const;

export const AllBusinessSuffixes = [
  ...llcBusinessSuffix,
  ...llpBusinessSuffix,
  ...lpBusinessSuffix,
  ...corpBusinessSuffix,
  ...foreignCorpBusinessSuffix,
  ...nonprofitBusinessSuffix,
] as const;

type v129BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v129FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v129FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v129FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v129GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

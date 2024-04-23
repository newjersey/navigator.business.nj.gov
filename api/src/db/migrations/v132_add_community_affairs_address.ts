import { v131Business, v131UserData } from "@db/migrations/v131_add_construction_type_essential_question";

export interface v132ProfileData extends v132IndustrySpecificData {
  businessPersona: v132BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v132Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v132ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v132ForeignBusinessTypeId[];
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v132OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v132CommunityAffairsAddress;
}

export type v132CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v132Municipality;
};
export const migrate_v131_to_v132 = (v131Data: v131UserData): v132UserData => {
  return {
    ...v131Data,
    businesses: Object.fromEntries(
      Object.values(v131Data.businesses)
        .map((business: v131Business) => migrate_v131Business_to_v132Business(business))
        .map((currBusiness: v132Business) => [currBusiness.id, currBusiness])
    ),
    version: 132,
  } as v132UserData;
};

const migrate_v131Business_to_v132Business = (business: v131Business): v132Business => {
  return {
    ...business,
    profileData: {
      ...business.profileData,
      communityAffairsAddress: undefined,
    },
  } as v132Business;
};

// ---------------- v132 types ----------------
type v132TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v132OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v132ABExperience = "ExperienceA" | "ExperienceB";

export interface v132UserData {
  user: v132BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v132Business>;
  currentBusinessId: string;
}

export interface v132Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v132ProfileData;
  onboardingFormProgress: v132OnboardingFormProgress;
  taskProgress: Record<string, v132TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v132LicenseData | undefined;
  preferences: v132Preferences;
  taxFilingData: v132TaxFilingData;
  formationData: v132FormationData;
}
export interface v132IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v132CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v132CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v132ConstructionType;
  residentialConstructionType: v132ResidentialConstructionType;
}

type v132BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v132ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v132ABExperience;
};

interface v132ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v132BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v132OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v132CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v132CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v132ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v132ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;

type v132ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v132Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v132TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v132TaxFilingErrorFields = "businessName" | "formFailure";

type v132TaxFilingData = {
  state?: v132TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v132TaxFilingErrorFields;
  businessName?: string;
  filings: v132TaxFilingCalendarEvent[];
};

export type v132CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v132TaxFilingCalendarEvent extends v132CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v132NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v132LicenseData = {
  nameAndAddress: v132NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v132LicenseStatus;
  items: v132LicenseStatusItem[];
};

type v132Preferences = {
  roadmapOpenSections: v132SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v132LicenseStatusItem = {
  title: string;
  status: v132CheckoffStatus;
};

type v132CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v132LicenseStatus =
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

const v132SectionNames = ["PLAN", "START"] as const;
type v132SectionType = (typeof v132SectionNames)[number];

type v132ExternalStatus = {
  newsletter?: v132NewsletterResponse;
  userTesting?: v132UserTestingResponse;
};

interface v132NewsletterResponse {
  success?: boolean;
  status: v132NewsletterStatus;
}

interface v132UserTestingResponse {
  success?: boolean;
  status: v132UserTestingStatus;
}

type v132NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v132UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v132NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v132NameAvailabilityResponse {
  status: v132NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v132NameAvailability extends v132NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v132FormationData {
  formationFormData: v132FormationFormData;
  businessNameAvailability: v132NameAvailability | undefined;
  dbaBusinessNameAvailability: v132NameAvailability | undefined;
  formationResponse: v132FormationSubmitResponse | undefined;
  getFilingResponse: v132GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v132InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v132FormationFormData extends v132FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v132BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v132InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v132InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v132InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v132InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v132Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v132FormationMember[] | undefined;
  readonly incorporators: v132FormationIncorporator[] | undefined;
  readonly signers: v132FormationSigner[] | undefined;
  readonly paymentType: v132PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v132StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v132ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v132ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v132StateObject = {
  shortCode: string;
  name: string;
};

interface v132FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v132StateObject;
  readonly addressMunicipality?: v132Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v132FormationBusinessLocationType | undefined;
}

type v132FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v132SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v132FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v132SignerTitle;
}

interface v132FormationIncorporator extends v132FormationSigner, v132FormationAddress {}

interface v132FormationMember extends v132FormationAddress {
  readonly name: string;
}

type v132PaymentType = "CC" | "ACH" | undefined;

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

type v132BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v132FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v132FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v132FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v132GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

import { v133Business, v133UserData } from "@db/migrations/v133_change_agent_office_address_city_field";

export interface v134ProfileData extends v134IndustrySpecificData {
  businessPersona: v134BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v134Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v134ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v134ForeignBusinessTypeId[];
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v134OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v134CommunityAffairsAddress;
}

export type v134CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v134Municipality;
};
export const migrate_v133_to_v134 = (v133Data: v133UserData): v134UserData => {
  return {
    ...v133Data,
    businesses: Object.fromEntries(
      Object.values(v133Data.businesses)
        .map((business: v133Business) => migrate_v133Business_to_v134Business(business))
        .map((currBusiness: v134Business) => [currBusiness.id, currBusiness])
    ),
    version: 134,
  } as v134UserData;
};

const migrate_v133Business_to_v134Business = (business: v133Business): v134Business => {
  const v134BusinessObj = {
    ...business,
    profileData: {
      ...business.profileData,
      plannedRenovationQuestion: undefined,
    },
  };

  return v134BusinessObj as v134Business;
};

// ---------------- v134 types ----------------
type v134TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v134OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v134ABExperience = "ExperienceA" | "ExperienceB";

export interface v134UserData {
  user: v134BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v134Business>;
  currentBusinessId: string;
}

export interface v134Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v134ProfileData;
  onboardingFormProgress: v134OnboardingFormProgress;
  taskProgress: Record<string, v134TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v134LicenseData | undefined;
  preferences: v134Preferences;
  taxFilingData: v134TaxFilingData;
  formationData: v134FormationData;
}
export interface v134IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v134CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v134CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v134ConstructionType;
  residentialConstructionType: v134ResidentialConstructionType;
}

type v134BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v134ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v134ABExperience;
};

interface v134ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v134BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v134OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v134CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v134CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v134ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v134ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;

type v134ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v134Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v134TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v134TaxFilingErrorFields = "businessName" | "formFailure";

type v134TaxFilingData = {
  state?: v134TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v134TaxFilingErrorFields;
  businessName?: string;
  filings: v134TaxFilingCalendarEvent[];
};

export type v134CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v134TaxFilingCalendarEvent extends v134CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v134NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v134LicenseData = {
  nameAndAddress: v134NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v134LicenseStatus;
  items: v134LicenseStatusItem[];
};

type v134Preferences = {
  roadmapOpenSections: v134SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v134LicenseStatusItem = {
  title: string;
  status: v134CheckoffStatus;
};

type v134CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v134LicenseStatus =
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

const v134SectionNames = ["PLAN", "START"] as const;
type v134SectionType = (typeof v134SectionNames)[number];

type v134ExternalStatus = {
  newsletter?: v134NewsletterResponse;
  userTesting?: v134UserTestingResponse;
};

interface v134NewsletterResponse {
  success?: boolean;
  status: v134NewsletterStatus;
}

interface v134UserTestingResponse {
  success?: boolean;
  status: v134UserTestingStatus;
}

type v134NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v134UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v134NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v134NameAvailabilityResponse {
  status: v134NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v134NameAvailability extends v134NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v134FormationData {
  formationFormData: v134FormationFormData;
  businessNameAvailability: v134NameAvailability | undefined;
  dbaBusinessNameAvailability: v134NameAvailability | undefined;
  formationResponse: v134FormationSubmitResponse | undefined;
  getFilingResponse: v134GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v134InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v134FormationFormData extends v134FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v134BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v134InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v134InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v134InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v134InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v134FormationMember[] | undefined;
  readonly incorporators: v134FormationIncorporator[] | undefined;
  readonly signers: v134FormationSigner[] | undefined;
  readonly paymentType: v134PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v134StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v134ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v134ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v134StateObject = {
  shortCode: string;
  name: string;
};

interface v134FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v134StateObject;
  readonly addressMunicipality?: v134Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v134FormationBusinessLocationType | undefined;
}

type v134FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v134SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v134FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v134SignerTitle;
}

interface v134FormationIncorporator extends v134FormationSigner, v134FormationAddress {}

interface v134FormationMember extends v134FormationAddress {
  readonly name: string;
}

type v134PaymentType = "CC" | "ACH" | undefined;

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

type v134BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v134FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v134FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v134FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v134GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

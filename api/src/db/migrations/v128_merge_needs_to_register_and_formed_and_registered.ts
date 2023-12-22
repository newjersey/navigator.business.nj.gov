import { v127Business, v127UserData } from "@db/migrations/v127_create_remote_worker_seller_phase";

export interface v128UserData {
  user: v128BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v128Business>;
  currentBusinessId: string;
}

export interface v128Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v128ProfileData;
  onboardingFormProgress: v128OnboardingFormProgress;
  taskProgress: Record<string, v128TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v128LicenseData | undefined;
  preferences: v128Preferences;
  taxFilingData: v128TaxFilingData;
  formationData: v128FormationData;
}

export const migrate_v127_to_v128 = (v127Data: v127UserData): v128UserData => {
  return {
    ...v127Data,
    businesses: Object.fromEntries(
      Object.values(v127Data.businesses)
        .map((business) => migrate_v127Business_to_v128Business(business))
        .map((currBusiness) => [currBusiness.id, currBusiness])
    ),
    version: 128,
  };
};

const migrate_v127Business_to_v128Business = (business: v127Business): v128Business => {
  const operatingPhase: v128OperatingPhase =
    business.profileData.operatingPhase === "NEEDS_TO_REGISTER_FOR_TAXES" ||
    business.profileData.operatingPhase === "FORMED_AND_REGISTERED"
      ? "FORMED"
      : business.profileData.operatingPhase;

  const visibleSidebarCards = business.preferences.visibleSidebarCards.filter(
    (x) => x !== "registered-for-taxes-nudge"
  );

  return {
    ...business,
    profileData: {
      ...business.profileData,
      operatingPhase,
    },
    preferences: {
      ...business.preferences,
      visibleSidebarCards,
    },
  };
};

// ---------------- v128 types ----------------
type v128TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v128OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v128ABExperience = "ExperienceA" | "ExperienceB";

type v128BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v128ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v128ABExperience;
};

interface v128ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v128BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v128OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

type v128CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v128IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v128CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v128ProfileData extends v128IndustrySpecificData {
  businessPersona: v128BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v128Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v128ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v128ForeignBusinessTypeId[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v128OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v128ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v128Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v128TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v128TaxFilingErrorFields = "businessName" | "formFailure";

type v128TaxFilingData = {
  state?: v128TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v128TaxFilingErrorFields;
  businessName?: string;
  filings: v128TaxFilingCalendarEvent[];
};

export type v128CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v128TaxFilingCalendarEvent extends v128CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v128NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v128LicenseData = {
  nameAndAddress: v128NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v128LicenseStatus;
  items: v128LicenseStatusItem[];
};

type v128Preferences = {
  roadmapOpenSections: v128SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v128LicenseStatusItem = {
  title: string;
  status: v128CheckoffStatus;
};

type v128CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v128LicenseStatus =
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

const v128SectionNames = ["PLAN", "START"] as const;
type v128SectionType = (typeof v128SectionNames)[number];

type v128ExternalStatus = {
  newsletter?: v128NewsletterResponse;
  userTesting?: v128UserTestingResponse;
};

interface v128NewsletterResponse {
  success?: boolean;
  status: v128NewsletterStatus;
}

interface v128UserTestingResponse {
  success?: boolean;
  status: v128UserTestingStatus;
}

type v128NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v128UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v128NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v128NameAvailabilityResponse {
  status: v128NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v128NameAvailability extends v128NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v128FormationData {
  formationFormData: v128FormationFormData;
  businessNameAvailability: v128NameAvailability | undefined;
  dbaBusinessNameAvailability: v128NameAvailability | undefined;
  formationResponse: v128FormationSubmitResponse | undefined;
  getFilingResponse: v128GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v128InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v128FormationFormData extends v128FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v128BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v128InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v128InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v128InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v128InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v128Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v128FormationMember[] | undefined;
  readonly incorporators: v128FormationIncorporator[] | undefined;
  readonly signers: v128FormationSigner[] | undefined;
  readonly paymentType: v128PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v128StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v128ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v128ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v128StateObject = {
  shortCode: string;
  name: string;
};

interface v128FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v128StateObject;
  readonly addressMunicipality?: v128Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v128FormationBusinessLocationType | undefined;
}

type v128FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v128SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v128FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v128SignerTitle;
}

interface v128FormationIncorporator extends v128FormationSigner, v128FormationAddress {}

interface v128FormationMember extends v128FormationAddress {
  readonly name: string;
}

type v128PaymentType = "CC" | "ACH" | undefined;

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

type v128BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v128FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v128FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v128FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v128GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

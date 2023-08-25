import { v122Business, v122UserData } from "./v122_remove_welcome_and_welcomeupandrunning_sidecards";

export interface v123UserData {
  user: v123BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v123Business>;
  currentBusinessId: string;
}

export interface v123Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v123ProfileData;
  onboardingFormProgress: v123OnboardingFormProgress;
  taskProgress: Record<string, v123TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v123LicenseData | undefined;
  preferences: v123Preferences;
  taxFilingData: v123TaxFilingData;
  formationData: v123FormationData;
}

export const migrate_v122_to_v123 = (v122Data: v122UserData): v123UserData => {
  return {
    ...v122Data,
    businesses: Object.fromEntries(
      Object.values(v122Data.businesses)
        .map((business) => migrate_v122Business_to_v123Business(business))
        .map((currBusiness) => [currBusiness.id, currBusiness])
    ),
    version: 123,
  };
};

const migrate_v122Business_to_v123Business = (v122BusinessData: v122Business): v123Business => {
  const updatedCards = v122BusinessData.preferences.visibleSidebarCards.filter((cardId) => {
    return cardId !== "successful-registration";
  });

  return {
    ...v122BusinessData,
    preferences: {
      ...v122BusinessData.preferences,
      visibleSidebarCards: updatedCards,
    },
  };
};

// ---------------- v123 types ----------------
type v123TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v123OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v123ABExperience = "ExperienceA" | "ExperienceB";

type v123BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v123ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v123ABExperience;
};

interface v123ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v123BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v123ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v123OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v123CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v123IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v123CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v123ProfileData extends v123IndustrySpecificData {
  businessPersona: v123BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v123Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v123ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v123ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v123OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v123Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v123TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v123TaxFilingErrorFields = "businessName" | "formFailure";

type v123TaxFilingData = {
  state?: v123TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v123TaxFilingErrorFields;
  businessName?: string;
  filings: v123TaxFilingCalendarEvent[];
};

export type v123CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v123TaxFilingCalendarEvent extends v123CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v123NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v123LicenseData = {
  nameAndAddress: v123NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v123LicenseStatus;
  items: v123LicenseStatusItem[];
};

type v123Preferences = {
  roadmapOpenSections: v123SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v123LicenseStatusItem = {
  title: string;
  status: v123CheckoffStatus;
};

type v123CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v123LicenseStatus =
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

const v123SectionNames = ["PLAN", "START"] as const;
type v123SectionType = (typeof v123SectionNames)[number];

type v123ExternalStatus = {
  newsletter?: v123NewsletterResponse;
  userTesting?: v123UserTestingResponse;
};

interface v123NewsletterResponse {
  success?: boolean;
  status: v123NewsletterStatus;
}

interface v123UserTestingResponse {
  success?: boolean;
  status: v123UserTestingStatus;
}

type v123NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v123UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v123NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v123NameAvailabilityResponse {
  status: v123NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v123NameAvailability extends v123NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v123FormationData {
  formationFormData: v123FormationFormData;
  businessNameAvailability: v123NameAvailability | undefined;
  dbaBusinessNameAvailability: v123NameAvailability | undefined;
  formationResponse: v123FormationSubmitResponse | undefined;
  getFilingResponse: v123GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v123InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v123FormationFormData extends v123FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v123BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v123InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v123InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v123InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v123InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly provisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v123Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v123FormationMember[] | undefined;
  readonly incorporators: v123FormationIncorporator[] | undefined;
  readonly signers: v123FormationSigner[] | undefined;
  readonly paymentType: v123PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v123StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v123ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v123ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v123StateObject = {
  shortCode: string;
  name: string;
};

interface v123FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v123StateObject;
  readonly addressMunicipality?: v123Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v123FormationBusinessLocationType | undefined;
}

type v123FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v123SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v123FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v123SignerTitle;
}

interface v123FormationIncorporator extends v123FormationSigner, v123FormationAddress {}

interface v123FormationMember extends v123FormationAddress {
  readonly name: string;
}

type v123PaymentType = "CC" | "ACH" | undefined;

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

type v123BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v123FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v123FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v123FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v123GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

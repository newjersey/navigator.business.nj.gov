import { v121Business, v121UserData } from "./v121_add_nonprofit_formation_fields";

export interface v122UserData {
  user: v122BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v122Business>;
  currentBusinessId: string;
}

export interface v122Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v122ProfileData;
  onboardingFormProgress: v122OnboardingFormProgress;
  taskProgress: Record<string, v122TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v122LicenseData | undefined;
  preferences: v122Preferences;
  taxFilingData: v122TaxFilingData;
  formationData: v122FormationData;
}

export const migrate_v121_to_v122 = (v121Data: v121UserData): v122UserData => {
  return {
    ...v121Data,
    businesses: Object.fromEntries(
      Object.values(v121Data.businesses)
        .map((business) => migrate_v121Business_to_v122Business(business))
        .map((currBusiness) => [currBusiness.id, currBusiness]),
    ),
    version: 122,
  };
};

const migrate_v121Business_to_v122Business = (v121BusinessData: v121Business): v122Business => {
  const updatedCards = v121BusinessData.preferences.visibleSidebarCards.filter((cardId) => {
    return cardId !== "welcome" && cardId !== "welcome-up-and-running";
  });

  return {
    ...v121BusinessData,
    preferences: {
      ...v121BusinessData.preferences,
      visibleSidebarCards: updatedCards,
    },
  };
};

// ---------------- v122 types ----------------
type v122TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v122OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v122ABExperience = "ExperienceA" | "ExperienceB";

type v122BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v122ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v122ABExperience;
};

interface v122ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v122BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v122ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v122OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v122CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v122IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v122CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v122ProfileData extends v122IndustrySpecificData {
  businessPersona: v122BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v122Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v122ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v122ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v122OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v122Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v122TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v122TaxFilingErrorFields = "businessName" | "formFailure";

type v122TaxFilingData = {
  state?: v122TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v122TaxFilingErrorFields;
  businessName?: string;
  filings: v122TaxFilingCalendarEvent[];
};

export type v122CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v122TaxFilingCalendarEvent extends v122CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v122NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v122LicenseData = {
  nameAndAddress: v122NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v122LicenseStatus;
  items: v122LicenseStatusItem[];
};

type v122Preferences = {
  roadmapOpenSections: v122SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v122LicenseStatusItem = {
  title: string;
  status: v122CheckoffStatus;
};

type v122CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v122LicenseStatus =
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

const v122SectionNames = ["PLAN", "START"] as const;
type v122SectionType = (typeof v122SectionNames)[number];

type v122ExternalStatus = {
  newsletter?: v122NewsletterResponse;
  userTesting?: v122UserTestingResponse;
};

interface v122NewsletterResponse {
  success?: boolean;
  status: v122NewsletterStatus;
}

interface v122UserTestingResponse {
  success?: boolean;
  status: v122UserTestingStatus;
}

type v122NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v122UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v122NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v122NameAvailabilityResponse {
  status: v122NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v122NameAvailability extends v122NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v122FormationData {
  formationFormData: v122FormationFormData;
  businessNameAvailability: v122NameAvailability | undefined;
  dbaBusinessNameAvailability: v122NameAvailability | undefined;
  formationResponse: v122FormationSubmitResponse | undefined;
  getFilingResponse: v122GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v122InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v122FormationFormData extends v122FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v122BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v122InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v122InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v122InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v122InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly provisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v122Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v122FormationMember[] | undefined;
  readonly incorporators: v122FormationIncorporator[] | undefined;
  readonly signers: v122FormationSigner[] | undefined;
  readonly paymentType: v122PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v122StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v122ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v122ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v122StateObject = {
  shortCode: string;
  name: string;
};

interface v122FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v122StateObject;
  readonly addressMunicipality?: v122Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v122FormationBusinessLocationType | undefined;
}

type v122FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v122SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v122FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v122SignerTitle;
}

interface v122FormationIncorporator extends v122FormationSigner, v122FormationAddress {}

interface v122FormationMember extends v122FormationAddress {
  readonly name: string;
}

type v122PaymentType = "CC" | "ACH" | undefined;

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

type v122BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v122FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v122FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v122FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v122GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

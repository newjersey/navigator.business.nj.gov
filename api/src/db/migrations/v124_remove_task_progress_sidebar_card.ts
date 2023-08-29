import { v123Business, v123UserData } from "./v123_remove_account_creation_sidecards";

export interface v124UserData {
  user: v124BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v124Business>;
  currentBusinessId: string;
}

export interface v124Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v124ProfileData;
  onboardingFormProgress: v124OnboardingFormProgress;
  taskProgress: Record<string, v124TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v124LicenseData | undefined;
  preferences: v124Preferences;
  taxFilingData: v124TaxFilingData;
  formationData: v124FormationData;
}

export const migrate_v123_to_v124 = (v123Data: v123UserData): v124UserData => {
  return {
    ...v123Data,
    businesses: Object.fromEntries(
      Object.values(v123Data.businesses)
        .map((business) => migrate_v123Business_to_v124Business(business))
        .map((currBusiness) => [currBusiness.id, currBusiness])
    ),
    version: 124,
  };
};

const migrate_v123Business_to_v124Business = (v123BusinessData: v123Business): v124Business => {
  const updatedCards = v123BusinessData.preferences.visibleSidebarCards.filter((cardId) => {
    return cardId !== "task-progress";
  });

  return {
    ...v123BusinessData,
    preferences: {
      ...v123BusinessData.preferences,
      visibleSidebarCards: updatedCards,
    },
  };
};

// ---------------- v124 types ----------------
type v124TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v124OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v124ABExperience = "ExperienceA" | "ExperienceB";

type v124BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v124ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v124ABExperience;
};

interface v124ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v124BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v124ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v124OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v124CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v124IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v124CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v124ProfileData extends v124IndustrySpecificData {
  businessPersona: v124BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v124Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v124ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v124ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v124OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v124Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v124TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v124TaxFilingErrorFields = "businessName" | "formFailure";

type v124TaxFilingData = {
  state?: v124TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v124TaxFilingErrorFields;
  businessName?: string;
  filings: v124TaxFilingCalendarEvent[];
};

export type v124CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v124TaxFilingCalendarEvent extends v124CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v124NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v124LicenseData = {
  nameAndAddress: v124NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v124LicenseStatus;
  items: v124LicenseStatusItem[];
};

type v124Preferences = {
  roadmapOpenSections: v124SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v124LicenseStatusItem = {
  title: string;
  status: v124CheckoffStatus;
};

type v124CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v124LicenseStatus =
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

const v124SectionNames = ["PLAN", "START"] as const;
type v124SectionType = (typeof v124SectionNames)[number];

type v124ExternalStatus = {
  newsletter?: v124NewsletterResponse;
  userTesting?: v124UserTestingResponse;
};

interface v124NewsletterResponse {
  success?: boolean;
  status: v124NewsletterStatus;
}

interface v124UserTestingResponse {
  success?: boolean;
  status: v124UserTestingStatus;
}

type v124NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v124UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v124NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v124NameAvailabilityResponse {
  status: v124NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v124NameAvailability extends v124NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v124FormationData {
  formationFormData: v124FormationFormData;
  businessNameAvailability: v124NameAvailability | undefined;
  dbaBusinessNameAvailability: v124NameAvailability | undefined;
  formationResponse: v124FormationSubmitResponse | undefined;
  getFilingResponse: v124GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v124InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v124FormationFormData extends v124FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v124BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v124InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v124InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v124InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v124InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly provisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v124Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v124FormationMember[] | undefined;
  readonly incorporators: v124FormationIncorporator[] | undefined;
  readonly signers: v124FormationSigner[] | undefined;
  readonly paymentType: v124PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v124StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v124ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v124ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v124StateObject = {
  shortCode: string;
  name: string;
};

interface v124FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v124StateObject;
  readonly addressMunicipality?: v124Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v124FormationBusinessLocationType | undefined;
}

type v124FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v124SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v124FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v124SignerTitle;
}

interface v124FormationIncorporator extends v124FormationSigner, v124FormationAddress {}

interface v124FormationMember extends v124FormationAddress {
  readonly name: string;
}

type v124PaymentType = "CC" | "ACH" | undefined;

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

type v124BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v124FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v124FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v124FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v124GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

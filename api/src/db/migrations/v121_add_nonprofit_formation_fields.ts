import { v120Business, v120UserData } from "./v120_add_missing_migration_data_fields";

export interface v121UserData {
  user: v121BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v121Business>;
  currentBusinessId: string;
}

export interface v121Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v121ProfileData;
  onboardingFormProgress: v121OnboardingFormProgress;
  taskProgress: Record<string, v121TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v121LicenseData | undefined;
  preferences: v121Preferences;
  taxFilingData: v121TaxFilingData;
  formationData: v121FormationData;
}

export const migrate_v120_to_v121 = (v120Data: v120UserData): v121UserData => {
  return {
    ...v120Data,
    businesses: Object.fromEntries(
      Object.values(v120Data.businesses)
        .map((business) => migrate_v120Business_to_v121Business(business))
        .map((currBusiness) => [currBusiness.id, currBusiness])
    ),
    version: 121,
  };
};

const migrate_v120Business_to_v121Business = (v120BusinessData: v120Business): v121Business => {
  return {
    ...v120BusinessData,
    formationData: {
      ...v120BusinessData.formationData,
      formationFormData: {
        ...v120BusinessData.formationData.formationFormData,
        hasNonprofitBoardMembers: undefined,
        nonprofitBoardMemberQualificationsSpecified: undefined,
        nonprofitBoardMemberQualificationsTerms: "",
        nonprofitBoardMemberRightsSpecified: undefined,
        nonprofitBoardMemberRightsTerms: "",
        nonprofitTrusteesMethodSpecified: undefined,
        nonprofitTrusteesMethodTerms: "",
        nonprofitAssetDistributionSpecified: undefined,
        nonprofitAssetDistributionTerms: "",
        isVeteranNonprofit: undefined,
      },
    },
  };
};

// ---------------- v121 types ----------------
type v121TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v121OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v121ABExperience = "ExperienceA" | "ExperienceB";

type v121BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v121ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v121ABExperience;
};

interface v121ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v121BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v121ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v121OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v121CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v121IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v121CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v121ProfileData extends v121IndustrySpecificData {
  businessPersona: v121BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v121Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v121ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v121ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v121OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v121Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v121TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v121TaxFilingErrorFields = "businessName" | "formFailure";

type v121TaxFilingData = {
  state?: v121TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v121TaxFilingErrorFields;
  businessName?: string;
  filings: v121TaxFilingCalendarEvent[];
};

export type v121CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v121TaxFilingCalendarEvent extends v121CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v121NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v121LicenseData = {
  nameAndAddress: v121NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v121LicenseStatus;
  items: v121LicenseStatusItem[];
};

type v121Preferences = {
  roadmapOpenSections: v121SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v121LicenseStatusItem = {
  title: string;
  status: v121CheckoffStatus;
};

type v121CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v121LicenseStatus =
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

const v121SectionNames = ["PLAN", "START"] as const;
type v121SectionType = (typeof v121SectionNames)[number];

type v121ExternalStatus = {
  newsletter?: v121NewsletterResponse;
  userTesting?: v121UserTestingResponse;
};

interface v121NewsletterResponse {
  success?: boolean;
  status: v121NewsletterStatus;
}

interface v121UserTestingResponse {
  success?: boolean;
  status: v121UserTestingStatus;
}

type v121NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v121UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v121NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v121NameAvailabilityResponse {
  status: v121NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v121NameAvailability extends v121NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v121FormationData {
  formationFormData: v121FormationFormData;
  businessNameAvailability: v121NameAvailability | undefined;
  dbaBusinessNameAvailability: v121NameAvailability | undefined;
  formationResponse: v121FormationSubmitResponse | undefined;
  getFilingResponse: v121GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v121InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v121FormationFormData extends v121FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v121BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v121InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v121InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v121InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v121InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly provisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v121Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v121FormationMember[] | undefined;
  readonly incorporators: v121FormationIncorporator[] | undefined;
  readonly signers: v121FormationSigner[] | undefined;
  readonly paymentType: v121PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v121StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v121ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v121ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v121StateObject = {
  shortCode: string;
  name: string;
};

interface v121FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v121StateObject;
  readonly addressMunicipality?: v121Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v121FormationBusinessLocationType | undefined;
}

type v121FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v121SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v121FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v121SignerTitle;
}

interface v121FormationIncorporator extends v121FormationSigner, v121FormationAddress {}

interface v121FormationMember extends v121FormationAddress {
  readonly name: string;
}

type v121PaymentType = "CC" | "ACH" | undefined;

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

type v121BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v121FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v121FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v121FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v121GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

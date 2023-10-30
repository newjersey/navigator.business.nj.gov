import { v125Business, v125UserData } from "@db/migrations/v125_rename_provisions_to_additional_provisions";

export interface v126UserData {
  user: v126BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v126Business>;
  currentBusinessId: string;
}

export interface v126Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v126ProfileData;
  onboardingFormProgress: v126OnboardingFormProgress;
  taskProgress: Record<string, v126TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v126LicenseData | undefined;
  preferences: v126Preferences;
  taxFilingData: v126TaxFilingData;
  formationData: v126FormationData;
}

export const migrate_v125_to_v126 = (v125Data: v125UserData): v126UserData => {
  return {
    ...v125Data,
    businesses: Object.fromEntries(
      Object.values(v125Data.businesses)
        .map((business) => migrate_v125Business_to_v126Business(business))
        .map((currBusiness) => [currBusiness.id, currBusiness])
    ),
    version: 126,
  };
};

const migrate_v125Business_to_v126Business = (v125BusinessData: v125Business): v126Business => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { foreignBusinessType, ...profileDataNoForeignBusinessType } = v125BusinessData.profileData;

  return {
    ...v125BusinessData,
    profileData: {
      ...profileDataNoForeignBusinessType,
    },
  };
};

// ---------------- v126 types ----------------
type v126TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v126OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v126ABExperience = "ExperienceA" | "ExperienceB";

type v126BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v126ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v126ABExperience;
};

interface v126ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v126BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v126OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v126CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v126IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v126CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v126ProfileData extends v126IndustrySpecificData {
  businessPersona: v126BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v126Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v126ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v126OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v126Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v126TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v126TaxFilingErrorFields = "businessName" | "formFailure";

type v126TaxFilingData = {
  state?: v126TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v126TaxFilingErrorFields;
  businessName?: string;
  filings: v126TaxFilingCalendarEvent[];
};

export type v126CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v126TaxFilingCalendarEvent extends v126CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v126NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v126LicenseData = {
  nameAndAddress: v126NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v126LicenseStatus;
  items: v126LicenseStatusItem[];
};

type v126Preferences = {
  roadmapOpenSections: v126SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v126LicenseStatusItem = {
  title: string;
  status: v126CheckoffStatus;
};

type v126CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v126LicenseStatus =
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

const v126SectionNames = ["PLAN", "START"] as const;
type v126SectionType = (typeof v126SectionNames)[number];

type v126ExternalStatus = {
  newsletter?: v126NewsletterResponse;
  userTesting?: v126UserTestingResponse;
};

interface v126NewsletterResponse {
  success?: boolean;
  status: v126NewsletterStatus;
}

interface v126UserTestingResponse {
  success?: boolean;
  status: v126UserTestingStatus;
}

type v126NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v126UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v126NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v126NameAvailabilityResponse {
  status: v126NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v126NameAvailability extends v126NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v126FormationData {
  formationFormData: v126FormationFormData;
  businessNameAvailability: v126NameAvailability | undefined;
  dbaBusinessNameAvailability: v126NameAvailability | undefined;
  formationResponse: v126FormationSubmitResponse | undefined;
  getFilingResponse: v126GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v126InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v126FormationFormData extends v126FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v126BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v126InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v126InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v126InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v126InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v126Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v126FormationMember[] | undefined;
  readonly incorporators: v126FormationIncorporator[] | undefined;
  readonly signers: v126FormationSigner[] | undefined;
  readonly paymentType: v126PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v126StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v126ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v126ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v126StateObject = {
  shortCode: string;
  name: string;
};

interface v126FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v126StateObject;
  readonly addressMunicipality?: v126Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v126FormationBusinessLocationType | undefined;
}

type v126FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v126SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v126FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v126SignerTitle;
}

interface v126FormationIncorporator extends v126FormationSigner, v126FormationAddress {}

interface v126FormationMember extends v126FormationAddress {
  readonly name: string;
}

type v126PaymentType = "CC" | "ACH" | undefined;

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

type v126BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v126FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v126FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v126FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v126GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

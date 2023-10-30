import { v124Business, v124UserData } from "@db/migrations/v124_remove_task_progress_sidebar_card";

export interface v125UserData {
  user: v125BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v125Business>;
  currentBusinessId: string;
}

export interface v125Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v125ProfileData;
  onboardingFormProgress: v125OnboardingFormProgress;
  taskProgress: Record<string, v125TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v125LicenseData | undefined;
  preferences: v125Preferences;
  taxFilingData: v125TaxFilingData;
  formationData: v125FormationData;
}

export const migrate_v124_to_v125 = (v124Data: v124UserData): v125UserData => {
  return {
    ...v124Data,
    businesses: Object.fromEntries(
      Object.values(v124Data.businesses)
        .map((business) => migrate_v124Business_to_v125Business(business))
        .map((currBusiness) => [currBusiness.id, currBusiness])
    ),
    version: 125,
  };
};

const migrate_v124Business_to_v125Business = (v124BusinessData: v124Business): v125Business => {
  return {
    ...v124BusinessData,
    formationData: {
      ...v124BusinessData.formationData,
      formationFormData: {
        ...v124BusinessData.formationData.formationFormData,
        additionalProvisions: v124BusinessData.formationData.formationFormData.provisions,
      },
    },
  };
};

// ---------------- v125 types ----------------
type v125TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v125OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v125ABExperience = "ExperienceA" | "ExperienceB";

type v125BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v125ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v125ABExperience;
};

interface v125ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v125BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v125ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v125OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v125CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v125IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v125CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v125ProfileData extends v125IndustrySpecificData {
  businessPersona: v125BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v125Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v125ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v125ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v125OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v125Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v125TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v125TaxFilingErrorFields = "businessName" | "formFailure";

type v125TaxFilingData = {
  state?: v125TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v125TaxFilingErrorFields;
  businessName?: string;
  filings: v125TaxFilingCalendarEvent[];
};

export type v125CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v125TaxFilingCalendarEvent extends v125CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v125NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v125LicenseData = {
  nameAndAddress: v125NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v125LicenseStatus;
  items: v125LicenseStatusItem[];
};

type v125Preferences = {
  roadmapOpenSections: v125SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v125LicenseStatusItem = {
  title: string;
  status: v125CheckoffStatus;
};

type v125CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v125LicenseStatus =
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

const v125SectionNames = ["PLAN", "START"] as const;
type v125SectionType = (typeof v125SectionNames)[number];

type v125ExternalStatus = {
  newsletter?: v125NewsletterResponse;
  userTesting?: v125UserTestingResponse;
};

interface v125NewsletterResponse {
  success?: boolean;
  status: v125NewsletterStatus;
}

interface v125UserTestingResponse {
  success?: boolean;
  status: v125UserTestingStatus;
}

type v125NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v125UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v125NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v125NameAvailabilityResponse {
  status: v125NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v125NameAvailability extends v125NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v125FormationData {
  formationFormData: v125FormationFormData;
  businessNameAvailability: v125NameAvailability | undefined;
  dbaBusinessNameAvailability: v125NameAvailability | undefined;
  formationResponse: v125FormationSubmitResponse | undefined;
  getFilingResponse: v125GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v125InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v125FormationFormData extends v125FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v125BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v125InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v125InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v125InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v125InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v125Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v125FormationMember[] | undefined;
  readonly incorporators: v125FormationIncorporator[] | undefined;
  readonly signers: v125FormationSigner[] | undefined;
  readonly paymentType: v125PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v125StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v125ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v125ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v125StateObject = {
  shortCode: string;
  name: string;
};

interface v125FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v125StateObject;
  readonly addressMunicipality?: v125Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v125FormationBusinessLocationType | undefined;
}

type v125FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v125SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v125FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v125SignerTitle;
}

interface v125FormationIncorporator extends v125FormationSigner, v125FormationAddress {}

interface v125FormationMember extends v125FormationAddress {
  readonly name: string;
}

type v125PaymentType = "CC" | "ACH" | undefined;

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

type v125BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v125FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v125FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v125FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v125GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

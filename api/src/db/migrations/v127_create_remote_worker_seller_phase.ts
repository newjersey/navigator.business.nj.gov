import { v126Business, v126UserData } from "@db/migrations/v126_remove_foreign_business_type";

export interface v127UserData {
  user: v127BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v127Business>;
  currentBusinessId: string;
}

export interface v127Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v127ProfileData;
  onboardingFormProgress: v127OnboardingFormProgress;
  taskProgress: Record<string, v127TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v127LicenseData | undefined;
  preferences: v127Preferences;
  taxFilingData: v127TaxFilingData;
  formationData: v127FormationData;
}

export const migrate_v126_to_v127 = (v126Data: v126UserData): v127UserData => {
  return {
    ...v126Data,
    businesses: Object.fromEntries(
      Object.values(v126Data.businesses)
        .map((business) => migrate_v126Business_to_v127Business(business))
        .map((currBusiness) => [currBusiness.id, currBusiness])
    ),
    version: 127,
  };
};

const determineForeignBusinessType = (ids: v127ForeignBusinessTypeId[]): string | undefined => {
  if (ids.includes("none")) return "NONE";
  if (ids.includes("employeeOrContractorInNJ")) return "NEXUS";
  if (ids.includes("officeInNJ")) return "NEXUS";
  if (ids.includes("propertyInNJ")) return "NEXUS";
  if (ids.includes("companyOperatedVehiclesInNJ")) return "NEXUS";
  if (ids.includes("employeesInNJ")) return "REMOTE_WORKER";
  if (ids.includes("revenueInNJ")) return "REMOTE_SELLER";
  if (ids.includes("transactionsInNJ")) return "REMOTE_SELLER";
  return undefined;
};

const migrate_v126Business_to_v127Business = (business: v126Business): v127Business => {
  // no data is changing - casting this type was missed in a previous migration
  const ids = business.profileData.foreignBusinessTypeIds as v127ForeignBusinessTypeId[];

  const businessType = determineForeignBusinessType(ids);

  const operatingPhase: v127OperatingPhase =
    businessType === "REMOTE_WORKER" || businessType === "REMOTE_SELLER"
      ? "REMOTE_SELLER_WORKER"
      : business.profileData.operatingPhase;

  return {
    ...business,
    profileData: {
      ...business.profileData,
      foreignBusinessTypeIds: ids,
      operatingPhase,
    },
  };
};

// ---------------- v127 types ----------------
type v127TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v127OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v127ABExperience = "ExperienceA" | "ExperienceB";

type v127BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v127ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v127ABExperience;
};

interface v127ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v127BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v127OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

type v127CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v127IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v127CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v127ProfileData extends v127IndustrySpecificData {
  businessPersona: v127BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v127Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v127ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v127ForeignBusinessTypeId[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v127OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v127ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v127Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v127TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v127TaxFilingErrorFields = "businessName" | "formFailure";

type v127TaxFilingData = {
  state?: v127TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v127TaxFilingErrorFields;
  businessName?: string;
  filings: v127TaxFilingCalendarEvent[];
};

export type v127CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v127TaxFilingCalendarEvent extends v127CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v127NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v127LicenseData = {
  nameAndAddress: v127NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v127LicenseStatus;
  items: v127LicenseStatusItem[];
};

type v127Preferences = {
  roadmapOpenSections: v127SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v127LicenseStatusItem = {
  title: string;
  status: v127CheckoffStatus;
};

type v127CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v127LicenseStatus =
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

const v127SectionNames = ["PLAN", "START"] as const;
type v127SectionType = (typeof v127SectionNames)[number];

type v127ExternalStatus = {
  newsletter?: v127NewsletterResponse;
  userTesting?: v127UserTestingResponse;
};

interface v127NewsletterResponse {
  success?: boolean;
  status: v127NewsletterStatus;
}

interface v127UserTestingResponse {
  success?: boolean;
  status: v127UserTestingStatus;
}

type v127NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v127UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v127NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v127NameAvailabilityResponse {
  status: v127NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v127NameAvailability extends v127NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v127FormationData {
  formationFormData: v127FormationFormData;
  businessNameAvailability: v127NameAvailability | undefined;
  dbaBusinessNameAvailability: v127NameAvailability | undefined;
  formationResponse: v127FormationSubmitResponse | undefined;
  getFilingResponse: v127GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v127InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v127FormationFormData extends v127FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v127BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v127InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v127InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v127InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v127InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v127Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v127FormationMember[] | undefined;
  readonly incorporators: v127FormationIncorporator[] | undefined;
  readonly signers: v127FormationSigner[] | undefined;
  readonly paymentType: v127PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v127StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v127ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v127ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v127StateObject = {
  shortCode: string;
  name: string;
};

interface v127FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v127StateObject;
  readonly addressMunicipality?: v127Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v127FormationBusinessLocationType | undefined;
}

type v127FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v127SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v127FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v127SignerTitle;
}

interface v127FormationIncorporator extends v127FormationSigner, v127FormationAddress {}

interface v127FormationMember extends v127FormationAddress {
  readonly name: string;
}

type v127PaymentType = "CC" | "ACH" | undefined;

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

type v127BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v127FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v127FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v127FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v127GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

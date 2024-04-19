import { v130Business, v130UserData } from "@db/migrations/v130_remove_nexus_location_in_new_jersey";

export interface v131IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v131CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v131CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v131ConstructionType;
  residentialConstructionType: v131ResidentialConstructionType;
}

export const migrate_v130_to_v131 = (v130Data: v130UserData): v131UserData => {
  return {
    ...v130Data,
    businesses: Object.fromEntries(
      Object.values(v130Data.businesses)
        .map((business: v130Business) => migrate_v130Business_to_v131Business(business))
        .map((currBusiness: v131Business) => [currBusiness.id, currBusiness])
    ),
    version: 131,
  } as v131UserData;
};

const migrate_v130Business_to_v131Business = (business: v130Business): v131Business => {
  return {
    ...business,
    profileData: {
      ...business.profileData,
      constructionType: undefined,
      residentialConstructionType: undefined,
    },
  } as v131Business;
};

// ---------------- v131 types ----------------
type v131TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v131OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v131ABExperience = "ExperienceA" | "ExperienceB";

export interface v131UserData {
  user: v131BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v131Business>;
  currentBusinessId: string;
}

export interface v131Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v131ProfileData;
  onboardingFormProgress: v131OnboardingFormProgress;
  taskProgress: Record<string, v131TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v131LicenseData | undefined;
  preferences: v131Preferences;
  taxFilingData: v131TaxFilingData;
  formationData: v131FormationData;
}

export interface v131ProfileData extends v131IndustrySpecificData {
  businessPersona: v131BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v131Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v131ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v131ForeignBusinessTypeId[];
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v131OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
  elevatorOwningBusiness: boolean | undefined;
}

type v131BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v131ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v131ABExperience;
};

interface v131ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v131BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v131OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v131CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v131CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v131ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v131ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;

type v131ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v131Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v131TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v131TaxFilingErrorFields = "businessName" | "formFailure";

type v131TaxFilingData = {
  state?: v131TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v131TaxFilingErrorFields;
  businessName?: string;
  filings: v131TaxFilingCalendarEvent[];
};

export type v131CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v131TaxFilingCalendarEvent extends v131CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v131NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v131LicenseData = {
  nameAndAddress: v131NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v131LicenseStatus;
  items: v131LicenseStatusItem[];
};

type v131Preferences = {
  roadmapOpenSections: v131SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v131LicenseStatusItem = {
  title: string;
  status: v131CheckoffStatus;
};

type v131CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v131LicenseStatus =
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

const v131SectionNames = ["PLAN", "START"] as const;
type v131SectionType = (typeof v131SectionNames)[number];

type v131ExternalStatus = {
  newsletter?: v131NewsletterResponse;
  userTesting?: v131UserTestingResponse;
};

interface v131NewsletterResponse {
  success?: boolean;
  status: v131NewsletterStatus;
}

interface v131UserTestingResponse {
  success?: boolean;
  status: v131UserTestingStatus;
}

type v131NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v131UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v131NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v131NameAvailabilityResponse {
  status: v131NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v131NameAvailability extends v131NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v131FormationData {
  formationFormData: v131FormationFormData;
  businessNameAvailability: v131NameAvailability | undefined;
  dbaBusinessNameAvailability: v131NameAvailability | undefined;
  formationResponse: v131FormationSubmitResponse | undefined;
  getFilingResponse: v131GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v131InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v131FormationFormData extends v131FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v131BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v131InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v131InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v131InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v131InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v131Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v131FormationMember[] | undefined;
  readonly incorporators: v131FormationIncorporator[] | undefined;
  readonly signers: v131FormationSigner[] | undefined;
  readonly paymentType: v131PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v131StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v131ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v131ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v131StateObject = {
  shortCode: string;
  name: string;
};

interface v131FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v131StateObject;
  readonly addressMunicipality?: v131Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v131FormationBusinessLocationType | undefined;
}

type v131FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v131SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v131FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v131SignerTitle;
}

interface v131FormationIncorporator extends v131FormationSigner, v131FormationAddress {}

interface v131FormationMember extends v131FormationAddress {
  readonly name: string;
}

type v131PaymentType = "CC" | "ACH" | undefined;

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

type v131BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v131FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v131FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v131FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v131GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

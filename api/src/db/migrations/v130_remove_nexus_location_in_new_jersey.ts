import { v129Business, v129UserData } from "@db/migrations/v129_add_elevator_owning_business_to_profile";

interface v130ProfileData extends v130IndustrySpecificData {
  businessPersona: v130BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v130Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v130ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v130ForeignBusinessTypeId[];
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v130OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
  elevatorOwningBusiness: boolean | undefined;
}

export const migrate_v129_to_v130 = (v129Data: v129UserData): v130UserData => {
  return {
    ...v129Data,
    businesses: Object.fromEntries(
      Object.values(v129Data.businesses)
        .map((business: v129Business) => migrate_v129Business_to_v130Business(business))
        .map((currBusiness: v130Business) => [currBusiness.id, currBusiness])
    ),
    version: 130,
  } as v130UserData;
};

const migrate_v129Business_to_v130Business = (business: v129Business): v130Business => {
  if (
    business.profileData.nexusLocationInNewJersey === true &&
    !business.profileData.foreignBusinessTypeIds.includes("officeInNJ")
  ) {
    business.profileData.foreignBusinessTypeIds.push("officeInNJ");
  } else if (business.profileData.nexusLocationInNewJersey === false) {
    business.profileData.foreignBusinessTypeIds = business.profileData.foreignBusinessTypeIds.filter(
      (id) => id !== "officeInNJ"
    );
  }
  delete business.profileData.nexusLocationInNewJersey;
  return business;
};

// ---------------- v130 types ----------------
type v130TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v130OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v130ABExperience = "ExperienceA" | "ExperienceB";

export interface v130UserData {
  user: v130BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v129Business>;
  currentBusinessId: string;
}

export interface v130Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v130ProfileData;
  onboardingFormProgress: v130OnboardingFormProgress;
  taskProgress: Record<string, v130TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v130LicenseData | undefined;
  preferences: v130Preferences;
  taxFilingData: v130TaxFilingData;
  formationData: v130FormationData;
}

type v130BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v130ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v130ABExperience;
};

interface v130ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v130BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v130OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

type v130CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v130IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v130CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

type v130ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v130Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v130TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v130TaxFilingErrorFields = "businessName" | "formFailure";

type v130TaxFilingData = {
  state?: v130TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v130TaxFilingErrorFields;
  businessName?: string;
  filings: v130TaxFilingCalendarEvent[];
};

export type v130CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v130TaxFilingCalendarEvent extends v130CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v130NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v130LicenseData = {
  nameAndAddress: v130NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v130LicenseStatus;
  items: v130LicenseStatusItem[];
};

type v130Preferences = {
  roadmapOpenSections: v130SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v130LicenseStatusItem = {
  title: string;
  status: v130CheckoffStatus;
};

type v130CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v130LicenseStatus =
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

const v130SectionNames = ["PLAN", "START"] as const;
type v130SectionType = (typeof v130SectionNames)[number];

type v130ExternalStatus = {
  newsletter?: v130NewsletterResponse;
  userTesting?: v130UserTestingResponse;
};

interface v130NewsletterResponse {
  success?: boolean;
  status: v130NewsletterStatus;
}

interface v130UserTestingResponse {
  success?: boolean;
  status: v130UserTestingStatus;
}

type v130NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v130UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v130NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v130NameAvailabilityResponse {
  status: v130NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v130NameAvailability extends v130NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v130FormationData {
  formationFormData: v130FormationFormData;
  businessNameAvailability: v130NameAvailability | undefined;
  dbaBusinessNameAvailability: v130NameAvailability | undefined;
  formationResponse: v130FormationSubmitResponse | undefined;
  getFilingResponse: v130GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v130InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v130FormationFormData extends v130FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v130BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v130InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v130InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v130InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v130InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v130Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v130FormationMember[] | undefined;
  readonly incorporators: v130FormationIncorporator[] | undefined;
  readonly signers: v130FormationSigner[] | undefined;
  readonly paymentType: v130PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v130StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v130ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v130ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v130StateObject = {
  shortCode: string;
  name: string;
};

interface v130FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v130StateObject;
  readonly addressMunicipality?: v130Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v130FormationBusinessLocationType | undefined;
}

type v130FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v130SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v130FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v130SignerTitle;
}

interface v130FormationIncorporator extends v130FormationSigner, v130FormationAddress {}

interface v130FormationMember extends v130FormationAddress {
  readonly name: string;
}

type v130PaymentType = "CC" | "ACH" | undefined;

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

type v130BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v130FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v130FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v130FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v130GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

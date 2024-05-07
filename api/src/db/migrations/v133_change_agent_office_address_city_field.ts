import { v132Business, v132UserData } from "@db/migrations/v132_add_community_affairs_address";

export interface v133ProfileData extends v133IndustrySpecificData {
  businessPersona: v133BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v133Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v133ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v133ForeignBusinessTypeId[];
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v133OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v133CommunityAffairsAddress;
}

export type v133CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v133Municipality;
};
export const migrate_v132_to_v133 = (v132Data: v132UserData): v133UserData => {
  return {
    ...v132Data,
    businesses: Object.fromEntries(
      Object.values(v132Data.businesses)
        .map((business: v132Business) => migrate_v132Business_to_v133Business(business))
        .map((currBusiness: v133Business) => [currBusiness.id, currBusiness])
    ),
    version: 133,
  } as v133UserData;
};

const migrate_v132Business_to_v133Business = (business: v132Business): v133Business => {
  const agentOfficeAddressCityAlreadyExists =
    business.formationData.formationFormData.agentOfficeAddressMunicipality?.displayName;

  const v133BusinessObj = {
    ...business,
    formationData: {
      ...business.formationData,
      formationFormData: {
        ...business.formationData.formationFormData,
        agentOfficeAddressCity: agentOfficeAddressCityAlreadyExists || "",
      },
    },
  };

  delete v133BusinessObj.formationData.formationFormData.agentOfficeAddressMunicipality;

  return v133BusinessObj as v133Business;
};

// ---------------- v133 types ----------------
type v133TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v133OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v133ABExperience = "ExperienceA" | "ExperienceB";

export interface v133UserData {
  user: v133BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v133Business>;
  currentBusinessId: string;
}

export interface v133Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v133ProfileData;
  onboardingFormProgress: v133OnboardingFormProgress;
  taskProgress: Record<string, v133TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v133LicenseData | undefined;
  preferences: v133Preferences;
  taxFilingData: v133TaxFilingData;
  formationData: v133FormationData;
}
export interface v133IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v133CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v133CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v133ConstructionType;
  residentialConstructionType: v133ResidentialConstructionType;
}

type v133BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v133ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v133ABExperience;
};

interface v133ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v133BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v133OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v133CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v133CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v133ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v133ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;

type v133ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v133Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v133TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v133TaxFilingErrorFields = "businessName" | "formFailure";

type v133TaxFilingData = {
  state?: v133TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v133TaxFilingErrorFields;
  businessName?: string;
  filings: v133TaxFilingCalendarEvent[];
};

export type v133CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v133TaxFilingCalendarEvent extends v133CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v133NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v133LicenseData = {
  nameAndAddress: v133NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v133LicenseStatus;
  items: v133LicenseStatusItem[];
};

type v133Preferences = {
  roadmapOpenSections: v133SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v133LicenseStatusItem = {
  title: string;
  status: v133CheckoffStatus;
};

type v133CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v133LicenseStatus =
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

const v133SectionNames = ["PLAN", "START"] as const;
type v133SectionType = (typeof v133SectionNames)[number];

type v133ExternalStatus = {
  newsletter?: v133NewsletterResponse;
  userTesting?: v133UserTestingResponse;
};

interface v133NewsletterResponse {
  success?: boolean;
  status: v133NewsletterStatus;
}

interface v133UserTestingResponse {
  success?: boolean;
  status: v133UserTestingStatus;
}

type v133NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v133UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v133NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v133NameAvailabilityResponse {
  status: v133NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v133NameAvailability extends v133NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v133FormationData {
  formationFormData: v133FormationFormData;
  businessNameAvailability: v133NameAvailability | undefined;
  dbaBusinessNameAvailability: v133NameAvailability | undefined;
  formationResponse: v133FormationSubmitResponse | undefined;
  getFilingResponse: v133GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v133InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v133FormationFormData extends v133FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v133BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v133InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v133InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v133InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v133InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v133FormationMember[] | undefined;
  readonly incorporators: v133FormationIncorporator[] | undefined;
  readonly signers: v133FormationSigner[] | undefined;
  readonly paymentType: v133PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v133StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v133ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v133ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v133StateObject = {
  shortCode: string;
  name: string;
};

interface v133FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v133StateObject;
  readonly addressMunicipality?: v133Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v133FormationBusinessLocationType | undefined;
}

type v133FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v133SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v133FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v133SignerTitle;
}

interface v133FormationIncorporator extends v133FormationSigner, v133FormationAddress {}

interface v133FormationMember extends v133FormationAddress {
  readonly name: string;
}

type v133PaymentType = "CC" | "ACH" | undefined;

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

type v133BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v133FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v133FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v133FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v133GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

import {
  v186Business,
  v186BusinessUser,
  v186UserData,
} from "@db/migrations/v186_zod_base64_encoding";
import { randomInt } from "@shared/intHelpers";

export const migrate_v186_to_v187 = (userData: v186UserData): v187UserData => {
  return {
    ...userData,
    user: migrate_v186BusinessUser_to_v187BusinessUser(userData.user),
    businesses: Object.fromEntries(
      Object.values(userData.businesses)
        .map((business: v186Business) => migrate_v186Business_to_v187Business(business))
        .map((currBusiness: v187Business) => [currBusiness.id, currBusiness]),
    ),
    version: 187,
  };
};

const migrate_v186BusinessUser_to_v187BusinessUser = (user: v186BusinessUser): v187BusinessUser => {
  return {
    ...user,
  };
};

const migrate_v186Business_to_v187Business = (business: v186Business): v187Business => {
  return {
    ...business,
    crtkData: undefined,
    version: 187,
  };
};

export interface v187IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness?: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v187CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v187CarServiceType | undefined;
  interstateTransport: boolean | undefined;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v187ConstructionType;
  residentialConstructionType: v187ResidentialConstructionType;
  employmentPersonnelServiceType: v187EmploymentAndPersonnelServicesType;
  employmentPlacementType: v187EmploymentPlacementType;
  propertyLeaseType: v187PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  publicWorksContractor: boolean | undefined;
}

export type v187PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v187 types ----------------
type v187TaskProgress = "TO_DO" | "COMPLETED";
type v187OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v187ABExperience = "ExperienceA" | "ExperienceB";

export interface v187UserData {
  user: v187BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v187Business>;
  currentBusinessId: string;
}

export interface v187Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  dateDeletedISO: string;
  profileData: v187ProfileData;
  onboardingFormProgress: v187OnboardingFormProgress;
  taskProgress: Record<string, v187TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v187LicenseData | undefined;
  preferences: v187Preferences;
  taxFilingData: v187TaxFilingData;
  formationData: v187FormationData;
  environmentData: v187EnvironmentData | undefined;
  xrayRegistrationData: v187XrayData | undefined;
  crtkData: v187CrtkData | undefined;
  roadmapTaskData: v187RoadmapTaskData;
  taxClearanceCertificateData: v187TaxClearanceCertificateData | undefined;
  cigaretteLicenseData: v187CigaretteLicenseData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v187RoadmapTaskData {
  manageBusinessVehicles?: boolean;
  passengerTransportSchoolBus?: boolean;
  passengerTransportSixteenOrMorePassengers?: boolean;
}

export interface v187ProfileData extends v187IndustrySpecificData {
  businessPersona: v187BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v187Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  hashedTaxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v187ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v187ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v187OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v187CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
  employerAccessRegistration: boolean | undefined;
  deptOfLaborEin: string;
}

export type v187CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v187Municipality;
};

export type v187BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  receiveUpdatesAndReminders: boolean;
  externalStatus: v187ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v187ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
  phoneNumber?: string;
};

export interface v187ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v187BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v187OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v187CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v187CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v187ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v187ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v187EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v187EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v187ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

export type v187Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v187TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v187TaxFilingErrorFields = "businessName" | "formFailure";

export type v187TaxFilingData = {
  state?: v187TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v187TaxFilingErrorFields;
  businessName?: string;
  filings: v187TaxFilingCalendarEvent[];
};

export type v187CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v187TaxFilingCalendarEvent extends v187CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v187LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v187LicenseSearchNameAndAddress extends v187LicenseSearchAddress {
  name: string;
}

export type v187LicenseDetails = {
  nameAndAddress: v187LicenseSearchNameAndAddress;
  licenseStatus: v187LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v187LicenseStatusItem[];
};

const v187taskIdLicenseNameMapping = {
  "apply-for-shop-license": "Cosmetology and Hairstyling-Shop",
  "appraiser-license": "Real Estate Appraisers-Appraisal Management Company",
  "architect-license": "Architecture-Certificate of Authorization",
  "health-club-registration": "Health Club Services",
  "home-health-aide-license": "Health Care Services",
  "hvac-license": "HVACR-HVACR CE Sponsor",
  "landscape-architect-license": "Landscape Architecture-Certificate of Authorization",
  "license-massage-therapy": "Massage and Bodywork Therapy-Massage and Bodywork Employer",
  "moving-company-license": "Public Movers and Warehousemen-Public Mover and Warehouseman",
  "pharmacy-license": "Pharmacy-Pharmacy",
  "public-accountant-license": "Accountancy-Firm Registration",
  "register-accounting-firm": "Accountancy-Firm Registration",
  "register-consumer-affairs": "Home Improvement Contractors-Home Improvement Contractor",
  "ticket-broker-reseller-registration": "Ticket Brokers",
  "telemarketing-license": "Telemarketers",
} as const;

type v187LicenseTaskID = keyof typeof v187taskIdLicenseNameMapping;

export type v187LicenseName = (typeof v187taskIdLicenseNameMapping)[v187LicenseTaskID];

type v187Licenses = Partial<Record<v187LicenseName, v187LicenseDetails>>;

export type v187LicenseData = {
  lastUpdatedISO: string;
  licenses?: v187Licenses;
};

export type v187Preferences = {
  roadmapOpenSections: v187SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
  isNonProfitFromFunding?: boolean;
};

export type v187LicenseStatusItem = {
  title: string;
  status: v187CheckoffStatus;
};

type v187CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v187LicenseStatus =
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

const v187LicenseStatuses: v187LicenseStatus[] = [
  "ACTIVE",
  "PENDING",
  "UNKNOWN",
  "EXPIRED",
  "BARRED",
  "OUT_OF_BUSINESS",
  "REINSTATEMENT_PENDING",
  "CLOSED",
  "DELETED",
  "DENIED",
  "VOLUNTARY_SURRENDER",
  "WITHDRAWN",
];

const v187SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
export type v187SectionType = (typeof v187SectionNames)[number];

export type v187ExternalStatus = {
  newsletter?: v187NewsletterResponse;
  userTesting?: v187UserTestingResponse;
};

export interface v187NewsletterResponse {
  success?: boolean;
  status: v187NewsletterStatus;
}

export interface v187UserTestingResponse {
  success?: boolean;
  status: v187UserTestingStatus;
}

type v187NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v187UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v187NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

export interface v187NameAvailabilityResponse {
  status: v187NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

export interface v187NameAvailability extends v187NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

export interface v187FormationData {
  formationFormData: v187FormationFormData;
  businessNameAvailability: v187NameAvailability | undefined;
  dbaBusinessNameAvailability: v187NameAvailability | undefined;
  formationResponse: v187FormationSubmitResponse | undefined;
  getFilingResponse: v187GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v187InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;
type v187HowToProceedOptions = "DIFFERENT_NAME" | "KEEP_NAME" | "CANCEL_NAME";

export interface v187FormationFormData extends v187FormationAddress {
  readonly businessName: string;
  readonly businessNameConfirmation: boolean;
  readonly businessSuffix: v187BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v187InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v187InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v187InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v187InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentType: "MYSELF" | "AUTHORIZED_REP" | "PROFESSIONAL_SERVICE";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v187FormationMember[] | undefined;
  readonly incorporators: v187FormationIncorporator[] | undefined;
  readonly signers: v187FormationSigner[] | undefined;
  readonly paymentType: v187PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v187StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v187ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
  readonly checkNameReservation: boolean;
  readonly howToProceed: v187HowToProceedOptions;
}

export type v187ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

export type v187StateObject = {
  shortCode: string;
  name: string;
};

export interface v187FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v187StateObject;
  readonly addressMunicipality?: v187Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry?: string;
  readonly businessLocationType: v187FormationBusinessLocationType | undefined;
}

type v187FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v187SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

export interface v187FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v187SignerTitle;
}

export interface v187FormationIncorporator extends v187FormationSigner, v187FormationAddress {}

export interface v187FormationMember extends v187FormationAddress {
  readonly name: string;
}

type v187PaymentType = "CC" | "ACH" | undefined;

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

type v187BusinessSuffix = (typeof AllBusinessSuffixes)[number];

export type v187FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v187FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

export type v187FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

export type v187GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export interface v187EnvironmentData {
  questionnaireData?: v187QuestionnaireData;
  submitted?: boolean;
  emailSent?: boolean;
}

export type v187QuestionnaireData = {
  air: v187AirData;
  land: v187LandData;
  waste: v187WasteData;
  drinkingWater: v187DrinkingWaterData;
  wasteWater: v187WasteWaterData;
};

export type v187AirFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v187AirData = Record<v187AirFieldIds, boolean>;

export type v187LandFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v187LandData = Record<v187LandFieldIds, boolean>;

export type v187WasteFieldIds =
  | "transportWaste"
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v187WasteData = Record<v187WasteFieldIds, boolean>;

export type v187DrinkingWaterFieldIds =
  | "ownWell"
  | "combinedWellCapacity"
  | "wellDrilled"
  | "potableWater"
  | "noDrinkingWater";

export type v187DrinkingWaterData = Record<v187DrinkingWaterFieldIds, boolean>;

export type v187WasteWaterFieldIds =
  | "sanitaryWaste"
  | "industrialWaste"
  | "localSewage"
  | "septicSystem"
  | "streamsRiversOrLakes"
  | "needsTreatment"
  | "planningConstruction"
  | "stormWaterDischarge"
  | "takeoverIndustrialStormWaterPermit"
  | "noWasteWater";

export type v187WasteWaterData = Record<v187WasteWaterFieldIds, boolean>;

export type v187CrtkBusinessDetails = {
  businessName: string;
  addressLine1: string;
  city: string;
  addressZipCode: string;
  ein?: string;
};

export type v187CrtkSearchResult = "FOUND" | "NOT_FOUND";

export interface v187CrtkEntry {
  businessName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ein?: string;
  facilityId?: string;
  sicCode?: string;
  naicsCode?: string;
  naicsDescription?: string;
  businessActivity?: string;
  type?: string;
  facilityStatus?: string;
  eligibility?: string;
  status?: string;
  receivedDate?: string;
}

export interface v187CrtkEmailMetadata {
  username: string;
  email: string;
  businessName: string;
  businessStatus: string;
  businessAddress: string;
  industry: string;
  ein: string;
  naicsCode: string;
  businessActivities: string;
  materialOrProducts: string;
}

export type v187CrtkData = {
  lastUpdatedISO: string;
  crtkBusinessDetails?: v187CrtkBusinessDetails;
  crtkSearchResult: v187CrtkSearchResult;
  crtkEntry: v187CrtkEntry;
  crtkEmailSent?: boolean;
};

export type v187TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: v187StateObject | undefined;
  addressZipCode?: string | undefined;
  taxId: string | undefined;
  taxPin: string | undefined;
  hasPreviouslyReceivedCertificate: boolean | undefined;
  lastUpdatedISO: string | undefined;
};

export type v187CigaretteLicenseData = {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId?: string;
  encryptedTaxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: v187StateObject;
  addressZipCode?: string;
  mailingAddressIsTheSame?: boolean;
  mailingAddressLine1?: string;
  mailingAddressLine2?: string;
  mailingAddressCity?: string;
  mailingAddressState?: v187StateObject;
  mailingAddressZipCode?: string;
  contactName?: string;
  contactPhoneNumber?: string;
  contactEmail?: string;
  salesInfoStartDate?: string;
  salesInfoSupplier?: string[];
  signerName?: string;
  signerRelationship?: string;
  signature?: boolean;
  lastUpdatedISO?: string;
  paymentInfo?: v187CigaretteLicensePaymentInfo;
};

export type v187CigaretteLicensePaymentInfo = {
  token?: string;
  paymentComplete?: boolean;
  orderId?: number;
  orderStatus?: string;
  orderTimestamp?: string;
  confirmationEmailsent?: boolean;
};

export type v187XrayData = {
  facilityDetails?: v187FacilityDetails;
  machines?: v187MachineDetails[];
  status?: v187XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
  lastUpdatedISO?: string;
};

export type v187FacilityDetails = {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  addressZipCode: string;
};

export type v187MachineDetails = {
  name?: string;
  registrationNumber?: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type v187XrayRegistrationStatusResponse = {
  machines: v187MachineDetails[];
  status: v187XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type v187XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

// ---------------- v187 generators ----------------

export const generatev187UserData = (overrides: Partial<v187UserData>): v187UserData => {
  return {
    user: generatev187BusinessUser({}),
    version: 187,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev187Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev187BusinessUser = (
  overrides: Partial<v187BusinessUser>,
): v187BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    receiveNewsletter: true,
    userTesting: true,
    receiveUpdatesAndReminders: true,
    externalStatus: {
      userTesting: {
        success: true,
        status: "SUCCESS",
      },
    },
    myNJUserKey: undefined,
    intercomHash: undefined,
    abExperience: "ExperienceA",
    accountCreationSource: `some-source-${randomInt()}`,
    contactSharingWithAccountCreationPartner: true,
    phoneNumber: undefined,
    ...overrides,
  };
};

export const generatev187RoadmapTaskData = (
  overrides: Partial<v187RoadmapTaskData>,
): v187RoadmapTaskData => {
  return {
    manageBusinessVehicles: undefined,
    passengerTransportSchoolBus: undefined,
    passengerTransportSixteenOrMorePassengers: undefined,
    ...overrides,
  };
};

export const generatev187Business = (overrides: Partial<v187Business>): v187Business => {
  const profileData = generatev187ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    dateDeletedISO: "",
    profileData: profileData,
    preferences: generatev187Preferences({}),
    formationData: generatev187FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taxClearanceCertificateData: generatev187TaxClearanceCertificateData({}),
    cigaretteLicenseData: generatev187CigaretteLicenseData({}),
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    roadmapTaskData: generatev187RoadmapTaskData({}),
    licenseData: undefined,
    taxFilingData: generatev187TaxFilingData({}),
    environmentData: undefined,
    xrayRegistrationData: undefined,
    crtkData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 181,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev187ProfileData = (overrides: Partial<v187ProfileData>): v187ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev187IndustrySpecificData({}),
    businessPersona: persona,
    businessName: `some-business-name-${randomInt()}`,
    industryId: "restaurant",
    legalStructureId: "limited-liability-partnership",
    dateOfFormation: undefined,
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt() % 2 ? randomInt(9).toString() : randomInt(12).toString(),
    hashedTaxId: `some-hashed-tax-id`,
    encryptedTaxId: `some-encrypted-tax-id`,
    notes: `some-notes-${randomInt()}`,
    existingEmployees: randomInt(7).toString(),
    naicsCode: randomInt(6).toString(),
    nexusDbaName: "undefined",
    operatingPhase: "NEEDS_TO_FORM",
    ownershipTypeIds: [],
    documents: {
      certifiedDoc: `${id}/certifiedDoc-${randomInt()}.pdf`,
      formationDoc: `${id}/formationDoc-${randomInt()}.pdf`,
      standingDoc: `${id}/standingDoc-${randomInt()}.pdf`,
    },
    taxPin: randomInt(4).toString(),
    encryptedTaxPin: `some-encrypted-tax-pin`,
    sectorId: undefined,
    foreignBusinessTypeIds: [],
    municipality: undefined,
    responsibleOwnerName: `some-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    elevatorOwningBusiness: undefined,
    nonEssentialRadioAnswers: {},
    plannedRenovationQuestion: undefined,
    communityAffairsAddress: undefined,
    raffleBingoGames: undefined,
    businessOpenMoreThanTwoYears: undefined,
    employerAccessRegistration: undefined,
    deptOfLaborEin: `some-dept-of-labor-ein-${randomInt()}`,
    ...overrides,
  };
};

export const generatev187IndustrySpecificData = (
  overrides: Partial<v187IndustrySpecificData>,
): v187IndustrySpecificData => {
  return {
    liquorLicense: false,
    requiresCpa: false,
    homeBasedBusiness: false,
    cannabisLicenseType: undefined,
    cannabisMicrobusiness: undefined,
    constructionRenovationPlan: undefined,
    providesStaffingService: false,
    certifiedInteriorDesigner: false,
    realEstateAppraisalManagement: false,
    carService: undefined,
    interstateTransport: false,
    isChildcareForSixOrMore: undefined,
    willSellPetCareItems: undefined,
    petCareHousing: undefined,
    interstateLogistics: undefined,
    interstateMoving: undefined,
    constructionType: undefined,
    residentialConstructionType: undefined,
    employmentPersonnelServiceType: undefined,
    employmentPlacementType: undefined,
    propertyLeaseType: undefined,
    hasThreeOrMoreRentalUnits: undefined,
    publicWorksContractor: undefined,
    ...overrides,
  };
};

export const generatev187Preferences = (overrides: Partial<v187Preferences>): v187Preferences => {
  return {
    roadmapOpenSections: ["PLAN", "START"],
    roadmapOpenSteps: [],
    hiddenCertificationIds: [],
    hiddenFundingIds: [],
    visibleSidebarCards: [],
    returnToLink: "",
    isCalendarFullView: true,
    isHideableRoadmapOpen: false,
    phaseNewlyChanged: false,
    isNonProfitFromFunding: undefined,
    ...overrides,
  };
};

export const generatev187FormationData = (
  overrides: Partial<v187FormationData>,
  legalStructureId: string,
): v187FormationData => {
  return {
    formationFormData: generatev187FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev187FormationFormData = (
  overrides: Partial<v187FormationFormData>,
  legalStructureId: string,
): v187FormationFormData => {
  const isCorp = legalStructureId
    ? ["s-corporation", "c-corporation"].includes(legalStructureId)
    : false;

  return <v187FormationFormData>{
    businessName: `some-business-name-${randomInt()}`,
    businessNameConfirmation: true,
    businessSuffix: "LLC",
    businessTotalStock: isCorp ? randomInt().toString() : "",
    businessStartDate: new Date(Date.now()).toISOString().split("T")[0],
    businessPurpose: `some-purpose-${randomInt()}`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    addressCity: `city-${randomInt(3)}`,
    addressState: { shortCode: "123", name: "new-jersey" },
    addressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    addressCountry: `some-county`,
    addressMunicipality: generatev187Municipality({}),
    addressProvince: "",
    withdrawals: `some-withdrawals-text-${randomInt()}`,
    combinedInvestment: `some-combinedInvestment-text-${randomInt()}`,
    dissolution: `some-dissolution-text-${randomInt()}`,
    canCreateLimitedPartner: !!(randomInt() % 2),
    createLimitedPartnerTerms: `some-createLimitedPartnerTerms-text-${randomInt()}`,
    canGetDistribution: !!(randomInt() % 2),
    getDistributionTerms: `some-getDistributionTerms-text-${randomInt()}`,
    canMakeDistribution: !!(randomInt() % 2),
    makeDistributionTerms: `make-getDistributionTerms-text-${randomInt()}`,
    hasNonprofitBoardMembers: true,
    nonprofitBoardMemberQualificationsSpecified: "IN_BYLAWS",
    nonprofitBoardMemberQualificationsTerms: "",
    nonprofitBoardMemberRightsSpecified: "IN_BYLAWS",
    nonprofitBoardMemberRightsTerms: "",
    nonprofitTrusteesMethodSpecified: "IN_BYLAWS",
    nonprofitTrusteesMethodTerms: "",
    nonprofitAssetDistributionSpecified: "IN_BYLAWS",
    nonprofitAssetDistributionTerms: "",
    provisions: [],
    agentType: "MYSELF",
    agentNumberOrManual: randomInt() % 2 ? "NUMBER" : "MANUAL_ENTRY",
    agentNumber: `some-agent-number-${randomInt()}`,
    agentName: `some-agent-name-${randomInt()}`,
    agentEmail: `some-agent-email-${randomInt()}`,
    agentOfficeAddressLine1: `addr1-${randomInt(3)}`,
    agentOfficeAddressLine2: `addr2-${randomInt(3)}`,
    agentOfficeAddressCity: `city-${randomInt(3)}`,
    agentOfficeAddressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    agentUseAccountInfo: !!(randomInt() % 2),
    agentUseBusinessAddress: !!(randomInt() % 2),
    signers: [],
    members:
      legalStructureId === "limited-liability-partnership" ? [] : [generatev187FormationMember({})],
    incorporators: undefined,
    paymentType: randomInt() % 2 ? "ACH" : "CC",
    annualReportNotification: !!(randomInt() % 2),
    corpWatchNotification: !!(randomInt() % 2),
    officialFormationDocument: !!(randomInt() % 2),
    certificateOfStanding: !!(randomInt() % 2),
    certifiedCopyOfFormationDocument: !!(randomInt() % 2),
    contactFirstName: `some-contact-first-name-${randomInt()}`,
    contactLastName: `some-contact-last-name-${randomInt()}`,
    contactPhoneNumber: `some-contact-phone-number-${randomInt()}`,
    foreignStateOfFormation: undefined,
    foreignDateOfFormation: undefined,
    foreignGoodStandingFile: undefined,
    willPracticeLaw: false,
    isVeteranNonprofit: false,
    legalType: "",
    additionalProvisions: undefined,
    businessLocationType: undefined,
    checkNameReservation: false,
    howToProceed: "DIFFERENT_NAME",
    ...overrides,
  };
};

export const generatev187Municipality = (
  overrides: Partial<v187Municipality>,
): v187Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev187FormationMember = (
  overrides: Partial<v187FormationMember>,
): v187FormationMember => {
  return {
    name: `some-name`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    addressCity: `city-${randomInt(3)}`,
    addressState: { shortCode: "123", name: "new-jersey" },
    addressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    addressCountry: `some-county`,
    businessLocationType: undefined,
    ...overrides,
  };
};

export const generatev187TaxFilingData = (
  overrides: Partial<v187TaxFilingData>,
): v187TaxFilingData => {
  return {
    state: undefined,
    businessName: undefined,
    errorField: undefined,
    lastUpdatedISO: undefined,
    registeredISO: undefined,
    filings: [],
    ...overrides,
  };
};

export const generatev187LicenseDetails = (
  overrides: Partial<v187LicenseDetails>,
): v187LicenseDetails => {
  return {
    nameAndAddress: generatev187LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv187LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev187LicenseStatusItem()],
    ...overrides,
  };
};

const generatev187LicenseSearchNameAndAddress = (
  overrides: Partial<v187LicenseSearchNameAndAddress>,
): v187LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev187LicenseStatusItem = (): v187LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv187LicenseStatus = (): v187LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v187LicenseStatuses.length);
  return v187LicenseStatuses[randomIndex];
};

export const generatev187TaxClearanceCertificateData = (
  overrides: Partial<v187TaxClearanceCertificateData>,
): v187TaxClearanceCertificateData => {
  return {
    requestingAgencyId: "",
    businessName: `some-business-name-${randomInt()}`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    addressCity: `city-${randomInt(3)}`,
    addressState: undefined,
    addressZipCode: randomInt(5).toString(),
    taxId: `${randomInt(12)}`,
    taxPin: randomInt(4).toString(),
    hasPreviouslyReceivedCertificate: undefined,
    lastUpdatedISO: "",
    ...overrides,
  };
};

export const generatev187CigaretteLicenseData = (
  overrides: Partial<v187CigaretteLicenseData>,
): v187CigaretteLicenseData => {
  const taxId = randomInt(12).toString();
  const maskingCharacter = "*";
  return {
    businessName: `some-business-name-${randomInt()}`,
    responsibleOwnerName: `some-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    taxId: maskingCharacter.repeat(7) + taxId.slice(-5),
    encryptedTaxId: `encrypted-${taxId}`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    addressCity: `city-${randomInt(3)}`,
    addressState: undefined,
    addressZipCode: randomInt(5).toString(),
    mailingAddressIsTheSame: false,
    mailingAddressLine1: "",
    mailingAddressLine2: "",
    mailingAddressCity: "",
    mailingAddressState: undefined,
    mailingAddressZipCode: "",
    contactName: `some-contact-name-${randomInt()}`,
    contactPhoneNumber: `some-phone-number-${randomInt()}`,
    contactEmail: `some-email-${randomInt()}`,
    salesInfoStartDate: "08/31/2025",
    salesInfoSupplier: [],
    signerName: `some-signer-name-${randomInt()}`,
    signerRelationship: `some-signer-relationship-${randomInt()}`,
    signature: false,
    lastUpdatedISO: "",
    ...overrides,
  };
};

export const generatev187EnvironmentQuestionnaireData = ({
  airOverrides,
  landOverrides,
  wasteOverrides,
  drinkingWaterOverrides,
  wasteWaterOverrides,
}: {
  airOverrides?: Partial<v187AirData>;
  landOverrides?: Partial<v187LandData>;
  wasteOverrides?: Partial<v187WasteData>;
  drinkingWaterOverrides?: Partial<v187DrinkingWaterData>;
  wasteWaterOverrides?: Partial<v187WasteWaterData>;
}): v187QuestionnaireData => {
  return {
    air: {
      emitPollutants: false,
      emitEmissions: false,
      constructionActivities: false,
      noAir: false,
      ...airOverrides,
    },
    land: {
      takeOverExistingBiz: false,
      propertyAssessment: false,
      constructionActivities: false,
      siteImprovementWasteLands: false,
      noLand: false,
      ...landOverrides,
    },
    waste: {
      transportWaste: false,
      hazardousMedicalWaste: false,
      compostWaste: false,
      treatProcessWaste: false,
      constructionDebris: false,
      noWaste: false,
      ...wasteOverrides,
    },
    drinkingWater: {
      ownWell: false,
      combinedWellCapacity: false,
      wellDrilled: false,
      potableWater: false,
      noDrinkingWater: false,
      ...drinkingWaterOverrides,
    },
    wasteWater: {
      sanitaryWaste: false,
      industrialWaste: false,
      localSewage: false,
      septicSystem: false,
      streamsRiversOrLakes: false,
      needsTreatment: false,
      planningConstruction: false,
      stormWaterDischarge: false,
      takeoverIndustrialStormWaterPermit: false,
      noWasteWater: false,
      ...wasteWaterOverrides,
    },
  };
};

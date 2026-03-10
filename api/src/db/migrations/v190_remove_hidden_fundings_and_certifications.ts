import {
  v189Business,
  v189BusinessUser,
  v189UserData,
} from "@db/migrations/v189_update_env_task_id";
import { randomInt } from "@shared/intHelpers";

export const migrate_v189_to_v190 = (userData: v189UserData): v190UserData => {
  return {
    ...userData,
    user: migrate_v189BusinessUser_to_v190BusinessUser(userData.user),
    businesses: Object.fromEntries(
      Object.values(userData.businesses)
        .map((business: v189Business) => migrate_v189Business_to_v190Business(business))
        .map((currBusiness: v190Business) => [currBusiness.id, currBusiness]),
    ),
    version: 190,
  };
};

const migrate_v189BusinessUser_to_v190BusinessUser = (user: v189BusinessUser): v190BusinessUser => {
  return {
    ...user,
  };
};

const migrate_v189Business_to_v190Business = (business: v189Business): v190Business => {
  delete business.preferences.hiddenCertificationIds;
  delete business.preferences.hiddenFundingIds;

  return {
    ...business,
    version: 190,
  };
};

export interface v190IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean | undefined;
  homeBasedBusiness?: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v190CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v190CarServiceType | undefined;
  interstateTransport: boolean | undefined;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v190ConstructionType;
  residentialConstructionType: v190ResidentialConstructionType;
  employmentPersonnelServiceType: v190EmploymentAndPersonnelServicesType;
  employmentPlacementType: v190EmploymentPlacementType;
  propertyLeaseType: v190PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  publicWorksContractor: boolean | undefined;
}

export type v190PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v190 types ----------------
type v190TaskProgress = "TO_DO" | "COMPLETED";
type v190OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v190ABExperience = "ExperienceA" | "ExperienceB";

export interface v190UserData {
  user: v190BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v190Business>;
  currentBusinessId: string;
}

export interface v190Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  dateDeletedISO: string;
  profileData: v190ProfileData;
  onboardingFormProgress: v190OnboardingFormProgress;
  taskProgress: Record<string, v190TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v190LicenseData | undefined;
  preferences: v190Preferences;
  taxFilingData: v190TaxFilingData;
  formationData: v190FormationData;
  environmentData: v190EnvironmentData | undefined;
  xrayRegistrationData: v190XrayData | undefined;
  crtkData: v190CrtkData | undefined;
  roadmapTaskData: v190RoadmapTaskData;
  taxClearanceCertificateData: v190TaxClearanceCertificateData | undefined;
  cigaretteLicenseData: v190CigaretteLicenseData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v190RoadmapTaskData {
  manageBusinessVehicles?: boolean;
  passengerTransportSchoolBus?: boolean;
  passengerTransportSixteenOrMorePassengers?: boolean;
}

export interface v190ProfileData extends v190IndustrySpecificData {
  businessPersona: v190BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v190Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  hashedTaxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v190ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v190ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v190OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v190CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
  employerAccessRegistration: boolean | undefined;
  deptOfLaborEin: string;
}

export type v190CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v190Municipality;
};

export type v190BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  receiveUpdatesAndReminders: boolean;
  externalStatus: v190ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v190ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
  phoneNumber?: string;
};

export interface v190ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v190BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v190OperatingPhase =
  | "GUEST_MODE"
  | "GUEST_MODE_WITH_BUSINESS_STRUCTURE"
  | "GUEST_MODE_OWNING"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | "DOMESTIC_EMPLOYER"
  | undefined;

export type v190CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v190CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v190ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v190ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v190EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v190EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v190ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

export type v190Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v190TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v190TaxFilingErrorFields = "businessName" | "formFailure";

export type v190TaxFilingData = {
  state?: v190TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v190TaxFilingErrorFields;
  businessName?: string;
  filings: v190TaxFilingCalendarEvent[];
};

export type v190CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v190TaxFilingCalendarEvent extends v190CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v190LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v190LicenseSearchNameAndAddress extends v190LicenseSearchAddress {
  name: string;
}

export type v190LicenseDetails = {
  nameAndAddress: v190LicenseSearchNameAndAddress;
  licenseStatus: v190LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v190LicenseStatusItem[];
};

const v190taskIdLicenseNameMapping = {
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

type v190LicenseTaskID = keyof typeof v190taskIdLicenseNameMapping;

export type v190LicenseName = (typeof v190taskIdLicenseNameMapping)[v190LicenseTaskID];

type v190Licenses = Partial<Record<v190LicenseName, v190LicenseDetails>>;

export type v190LicenseData = {
  lastUpdatedISO: string;
  licenses?: v190Licenses;
};

export type v190Preferences = {
  roadmapOpenSections: v190SectionType[];
  roadmapOpenSteps: number[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
  isNonProfitFromFunding?: boolean;
};

export type v190LicenseStatusItem = {
  title: string;
  status: v190CheckoffStatus;
};

type v190CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v190LicenseStatus =
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

const v190LicenseStatuses: v190LicenseStatus[] = [
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

const v190SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
export type v190SectionType = (typeof v190SectionNames)[number];

export type v190ExternalStatus = {
  newsletter?: v190NewsletterResponse;
  userTesting?: v190UserTestingResponse;
};

export interface v190NewsletterResponse {
  success?: boolean;
  status: v190NewsletterStatus;
}

export interface v190UserTestingResponse {
  success?: boolean;
  status: v190UserTestingStatus;
}

type v190NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = [
  "SUCCESS",
  "IN_PROGRESS",
  "CONNECTION_ERROR",
  "RESPONSE_ERROR",
] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v190UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v190NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

export interface v190NameAvailabilityResponse {
  status: v190NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

export interface v190NameAvailability extends v190NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

export interface v190FormationData {
  formationFormData: v190FormationFormData;
  businessNameAvailability: v190NameAvailability | undefined;
  dbaBusinessNameAvailability: v190NameAvailability | undefined;
  formationResponse: v190FormationSubmitResponse | undefined;
  getFilingResponse: v190GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v190InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;
type v190HowToProceedOptions = "DIFFERENT_NAME" | "KEEP_NAME" | "CANCEL_NAME";

export interface v190FormationFormData extends v190FormationAddress {
  readonly businessName: string;
  readonly businessNameConfirmation: boolean | undefined;
  readonly businessSuffix: v190BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v190InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v190InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v190InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v190InFormInBylaws;
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
  readonly members: v190FormationMember[] | undefined;
  readonly incorporators: v190FormationIncorporator[] | undefined;
  readonly signers: v190FormationSigner[] | undefined;
  readonly paymentType: v190PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v190StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v190ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
  readonly checkNameReservation: boolean | undefined;
  readonly howToProceed: v190HowToProceedOptions;
}

export type v190ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

export type v190StateObject = {
  shortCode: string;
  name: string;
};

export interface v190FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v190StateObject;
  readonly addressMunicipality?: v190Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry?: string;
  readonly businessLocationType: v190FormationBusinessLocationType | undefined;
}

type v190FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v190SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

export interface v190FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v190SignerTitle;
}

export interface v190FormationIncorporator extends v190FormationSigner, v190FormationAddress {}

export interface v190FormationMember extends v190FormationAddress {
  readonly name: string;
}

type v190PaymentType = "CC" | "ACH" | undefined;

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

type v190BusinessSuffix = (typeof AllBusinessSuffixes)[number];

export type v190FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v190FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

export type v190FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

export type v190GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export interface v190EnvironmentData {
  questionnaireData?: v190QuestionnaireData;
  submitted?: boolean;
  emailSent?: boolean;
}

export type v190QuestionnaireData = {
  air: v190AirData;
  land: v190LandData;
  waste: v190WasteData;
  drinkingWater: v190DrinkingWaterData;
  wasteWater: v190WasteWaterData;
};

export type v190AirFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v190AirData = Record<v190AirFieldIds, boolean>;

export type v190LandFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v190LandData = Record<v190LandFieldIds, boolean>;

export type v190WasteFieldIds =
  | "transportWaste"
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v190WasteData = Record<v190WasteFieldIds, boolean>;

export type v190DrinkingWaterFieldIds =
  | "ownWell"
  | "combinedWellCapacity"
  | "wellDrilled"
  | "potableWater"
  | "noDrinkingWater";

export type v190DrinkingWaterData = Record<v190DrinkingWaterFieldIds, boolean>;

export type v190WasteWaterFieldIds =
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

export type v190WasteWaterData = Record<v190WasteWaterFieldIds, boolean>;

export type v190CrtkBusinessDetails = {
  businessName: string;
  addressLine1: string;
  city: string;
  addressZipCode: string;
  ein?: string | undefined;
};

export type v190CrtkSearchResult = "FOUND" | "NOT_FOUND";

export interface v190CrtkEntry {
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

export interface v190CrtkEmailMetadata {
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

export type v190CrtkData = {
  lastUpdatedISO: string;
  crtkBusinessDetails?: v190CrtkBusinessDetails;
  crtkSearchResult: v190CrtkSearchResult;
  crtkEntry: v190CrtkEntry;
  crtkEmailSent?: boolean;
};

export type v190TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: v190StateObject | undefined;
  addressZipCode?: string | undefined;
  taxId: string | undefined;
  taxPin: string | undefined;
  hasPreviouslyReceivedCertificate: boolean | undefined;
  lastUpdatedISO: string | undefined;
};

export type v190CigaretteLicenseData = {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId?: string;
  encryptedTaxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: v190StateObject;
  addressZipCode?: string;
  mailingAddressIsTheSame?: boolean;
  mailingAddressLine1?: string;
  mailingAddressLine2?: string;
  mailingAddressCity?: string;
  mailingAddressState?: v190StateObject;
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
  paymentInfo?: v190CigaretteLicensePaymentInfo;
};

export type v190CigaretteLicensePaymentInfo = {
  token?: string;
  paymentComplete?: boolean;
  orderId?: number;
  orderStatus?: string;
  orderTimestamp?: string;
  confirmationEmailsent?: boolean;
};

export type v190XrayData = {
  facilityDetails?: v190FacilityDetails;
  machines?: v190MachineDetails[];
  status?: v190XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
  lastUpdatedISO?: string;
};

export type v190FacilityDetails = {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  addressZipCode: string;
};

export type v190MachineDetails = {
  name?: string;
  registrationNumber?: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type v190XrayRegistrationStatusResponse = {
  machines: v190MachineDetails[];
  status: v190XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type v190XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

// ---------------- v190 generators ----------------

export const generatev190UserData = (overrides: Partial<v190UserData>): v190UserData => {
  return {
    user: generatev190BusinessUser({}),
    version: 190,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev190Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev190BusinessUser = (
  overrides: Partial<v190BusinessUser>,
): v190BusinessUser => {
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

export const generatev190RoadmapTaskData = (
  overrides: Partial<v190RoadmapTaskData>,
): v190RoadmapTaskData => {
  return {
    manageBusinessVehicles: undefined,
    passengerTransportSchoolBus: undefined,
    passengerTransportSixteenOrMorePassengers: undefined,
    ...overrides,
  };
};

export const generatev190Business = (overrides: Partial<v190Business>): v190Business => {
  const profileData = generatev190ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    dateDeletedISO: "",
    profileData: profileData,
    preferences: generatev190Preferences({}),
    formationData: generatev190FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taxClearanceCertificateData: generatev190TaxClearanceCertificateData({}),
    cigaretteLicenseData: generatev190CigaretteLicenseData({}),
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    roadmapTaskData: generatev190RoadmapTaskData({}),
    licenseData: undefined,
    taxFilingData: generatev190TaxFilingData({}),
    environmentData: undefined,
    xrayRegistrationData: undefined,
    crtkData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 190,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev190ProfileData = (overrides: Partial<v190ProfileData>): v190ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev190IndustrySpecificData({}),
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

export const generatev190IndustrySpecificData = (
  overrides: Partial<v190IndustrySpecificData>,
): v190IndustrySpecificData => {
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

export const generatev190Preferences = (overrides: Partial<v190Preferences>): v190Preferences => {
  return {
    roadmapOpenSections: ["PLAN", "START"],
    roadmapOpenSteps: [],
    visibleSidebarCards: [],
    returnToLink: "",
    isCalendarFullView: true,
    isHideableRoadmapOpen: false,
    phaseNewlyChanged: false,
    isNonProfitFromFunding: undefined,
    ...overrides,
  };
};

export const generatev190FormationData = (
  overrides: Partial<v190FormationData>,
  legalStructureId: string,
): v190FormationData => {
  return {
    formationFormData: generatev190FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev190FormationFormData = (
  overrides: Partial<v190FormationFormData>,
  legalStructureId: string,
): v190FormationFormData => {
  const isCorp = legalStructureId
    ? ["s-corporation", "c-corporation"].includes(legalStructureId)
    : false;

  return <v190FormationFormData>{
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
    addressMunicipality: generatev190Municipality({}),
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
      legalStructureId === "limited-liability-partnership" ? [] : [generatev190FormationMember({})],
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

export const generatev190Municipality = (
  overrides: Partial<v190Municipality>,
): v190Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev190FormationMember = (
  overrides: Partial<v190FormationMember>,
): v190FormationMember => {
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

export const generatev190TaxFilingData = (
  overrides: Partial<v190TaxFilingData>,
): v190TaxFilingData => {
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

export const generatev190LicenseDetails = (
  overrides: Partial<v190LicenseDetails>,
): v190LicenseDetails => {
  return {
    nameAndAddress: generatev190LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv190LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev190LicenseStatusItem()],
    ...overrides,
  };
};

const generatev190LicenseSearchNameAndAddress = (
  overrides: Partial<v190LicenseSearchNameAndAddress>,
): v190LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev190LicenseStatusItem = (): v190LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv190LicenseStatus = (): v190LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v190LicenseStatuses.length);
  return v190LicenseStatuses[randomIndex];
};

export const generatev190TaxClearanceCertificateData = (
  overrides: Partial<v190TaxClearanceCertificateData>,
): v190TaxClearanceCertificateData => {
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

export const generatev190CigaretteLicenseData = (
  overrides: Partial<v190CigaretteLicenseData>,
): v190CigaretteLicenseData => {
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

export const generatev190EnvironmentQuestionnaireData = ({
  airOverrides,
  landOverrides,
  wasteOverrides,
  drinkingWaterOverrides,
  wasteWaterOverrides,
}: {
  airOverrides?: Partial<v190AirData>;
  landOverrides?: Partial<v190LandData>;
  wasteOverrides?: Partial<v190WasteData>;
  drinkingWaterOverrides?: Partial<v190DrinkingWaterData>;
  wasteWaterOverrides?: Partial<v190WasteWaterData>;
}): v190QuestionnaireData => {
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

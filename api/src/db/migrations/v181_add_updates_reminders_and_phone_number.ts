import {
  v180Business,
  v180BusinessUser,
  v180UserData,
} from "@db/migrations/v180_add_email_sent_environment_data";
import { randomInt } from "@shared/intHelpers";

export const migrate_v180_to_v181 = (userData: v180UserData): v181UserData => {
  return {
    ...userData,
    user: migrate_v180BusinessUser_to_v181BusinessUser(userData.user),
    businesses: Object.fromEntries(
      Object.values(userData.businesses)
        .map((business: v180Business) => migrate_v180Business_to_v181Business(business))
        .map((currBusiness: v181Business) => [currBusiness.id, currBusiness]),
    ),
    version: 181,
  };
};

const migrate_v180BusinessUser_to_v181BusinessUser = (user: v180BusinessUser): v181BusinessUser => {
  return {
    ...user,
    receiveUpdatesAndReminders: true,
    phoneNumber: undefined,
  };
};

const migrate_v180Business_to_v181Business = (business: v180Business): v181Business => {
  return {
    ...business,
    version: 181,
  };
};

export interface v181IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v181CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v181CarServiceType | undefined;
  interstateTransport: boolean;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v181ConstructionType;
  residentialConstructionType: v181ResidentialConstructionType;
  employmentPersonnelServiceType: v181EmploymentAndPersonnelServicesType;
  employmentPlacementType: v181EmploymentPlacementType;
  carnivalRideOwningBusiness: boolean | undefined;
  propertyLeaseType: v181PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  travelingCircusOrCarnivalOwningBusiness: boolean | undefined;
  vacantPropertyOwner: boolean | undefined;
  publicWorksContractor: boolean | undefined;
}

export type v181PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v181 types ----------------
type v181TaskProgress = "TO_DO" | "COMPLETED";
type v181OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v181ABExperience = "ExperienceA" | "ExperienceB";

export interface v181UserData {
  user: v181BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v181Business>;
  currentBusinessId: string;
}

export interface v181Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  dateDeletedISO: string;
  profileData: v181ProfileData;
  onboardingFormProgress: v181OnboardingFormProgress;
  taskProgress: Record<string, v181TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v181LicenseData | undefined;
  preferences: v181Preferences;
  taxFilingData: v181TaxFilingData;
  formationData: v181FormationData;
  environmentData: v181EnvironmentData | undefined;
  xrayRegistrationData: v181XrayData | undefined;
  roadmapTaskData: v181RoadmapTaskData;
  taxClearanceCertificateData: v181TaxClearanceCertificateData | undefined;
  cigaretteLicenseData: v181CigaretteLicenseData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v181RoadmapTaskData {
  manageBusinessVehicles?: boolean;
  passengerTransportSchoolBus?: boolean;
  passengerTransportSixteenOrMorePassengers?: boolean;
}

export interface v181ProfileData extends v181IndustrySpecificData {
  businessPersona: v181BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v181Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  hashedTaxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v181ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v181ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v181OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v181CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
  employerAccessRegistration: boolean | undefined;
  deptOfLaborEin: string;
}

export type v181CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v181Municipality;
};

export type v181BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  receiveUpdatesAndReminders: boolean;
  externalStatus: v181ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v181ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
  phoneNumber?: string;
};

interface v181ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v181BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v181OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v181CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v181CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v181ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v181ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v181EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v181EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v181ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v181Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v181TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v181TaxFilingErrorFields = "businessName" | "formFailure";

type v181TaxFilingData = {
  state?: v181TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v181TaxFilingErrorFields;
  businessName?: string;
  filings: v181TaxFilingCalendarEvent[];
};

export type v181CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v181TaxFilingCalendarEvent extends v181CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v181LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v181LicenseSearchNameAndAddress extends v181LicenseSearchAddress {
  name: string;
}

type v181LicenseDetails = {
  nameAndAddress: v181LicenseSearchNameAndAddress;
  licenseStatus: v181LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v181LicenseStatusItem[];
};

const v181taskIdLicenseNameMapping = {
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

type v181LicenseTaskID = keyof typeof v181taskIdLicenseNameMapping;

export type v181LicenseName = (typeof v181taskIdLicenseNameMapping)[v181LicenseTaskID];

type v181Licenses = Partial<Record<v181LicenseName, v181LicenseDetails>>;

type v181LicenseData = {
  lastUpdatedISO: string;
  licenses?: v181Licenses;
};

type v181Preferences = {
  roadmapOpenSections: v181SectionType[];
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

type v181LicenseStatusItem = {
  title: string;
  status: v181CheckoffStatus;
};

type v181CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v181LicenseStatus =
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

const v181LicenseStatuses: v181LicenseStatus[] = [
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

const v181SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
type v181SectionType = (typeof v181SectionNames)[number];

type v181ExternalStatus = {
  newsletter?: v181NewsletterResponse;
  userTesting?: v181UserTestingResponse;
};

interface v181NewsletterResponse {
  success?: boolean;
  status: v181NewsletterStatus;
}

interface v181UserTestingResponse {
  success?: boolean;
  status: v181UserTestingStatus;
}

type v181NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v181UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v181NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v181NameAvailabilityResponse {
  status: v181NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v181NameAvailability extends v181NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

export interface v181FormationData {
  formationFormData: v181FormationFormData;
  businessNameAvailability: v181NameAvailability | undefined;
  dbaBusinessNameAvailability: v181NameAvailability | undefined;
  formationResponse: v181FormationSubmitResponse | undefined;
  getFilingResponse: v181GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v181InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;
type v181HowToProceedOptions = "DIFFERENT_NAME" | "KEEP_NAME" | "CANCEL_NAME";

export interface v181FormationFormData extends v181FormationAddress {
  readonly businessName: string;
  readonly businessNameConfirmation: boolean;
  readonly businessSuffix: v181BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v181InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v181InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v181InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v181InFormInBylaws;
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
  readonly members: v181FormationMember[] | undefined;
  readonly incorporators: v181FormationIncorporator[] | undefined;
  readonly signers: v181FormationSigner[] | undefined;
  readonly paymentType: v181PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v181StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v181ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
  readonly checkNameReservation: boolean;
  readonly howToProceed: v181HowToProceedOptions;
}

type v181ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v181StateObject = {
  shortCode: string;
  name: string;
};

interface v181FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v181StateObject;
  readonly addressMunicipality?: v181Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v181FormationBusinessLocationType | undefined;
}

type v181FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v181SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v181FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v181SignerTitle;
}

interface v181FormationIncorporator extends v181FormationSigner, v181FormationAddress {}

interface v181FormationMember extends v181FormationAddress {
  readonly name: string;
}

type v181PaymentType = "CC" | "ACH" | undefined;

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

type v181BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v181FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v181FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v181FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v181GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export interface v181EnvironmentData {
  questionnaireData?: v181QuestionnaireData;
  submitted?: boolean;
  emailSent?: boolean;
}

export type v181QuestionnaireData = {
  air: v181AirData;
  land: v181LandData;
  waste: v181WasteData;
  drinkingWater: v181DrinkingWaterData;
  wasteWater: v181WasteWaterData;
};

export type v181AirFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v181AirData = Record<v181AirFieldIds, boolean>;

export type v181LandFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v181LandData = Record<v181LandFieldIds, boolean>;

export type v181WasteFieldIds =
  | "transportWaste"
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v181WasteData = Record<v181WasteFieldIds, boolean>;

export type v181DrinkingWaterFieldIds =
  | "ownWell"
  | "combinedWellCapacity"
  | "wellDrilled"
  | "potableWater"
  | "noDrinkingWater";

export type v181DrinkingWaterData = Record<v181DrinkingWaterFieldIds, boolean>;

export type v181WasteWaterFieldIds =
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

export type v181WasteWaterData = Record<v181WasteWaterFieldIds, boolean>;

export type v181TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: v181StateObject | undefined;
  addressZipCode: string | undefined;
  taxId: string | undefined;
  taxPin: string | undefined;
  hasPreviouslyReceivedCertificate: boolean | undefined;
  lastUpdatedISO: string | undefined;
};

export type v181CigaretteLicenseData = {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId?: string;
  encryptedTaxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: v181StateObject;
  addressZipCode?: string;
  mailingAddressIsTheSame?: boolean;
  mailingAddressLine1?: string;
  mailingAddressLine2?: string;
  mailingAddressCity?: string;
  mailingAddressState?: v181StateObject;
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
  paymentInfo?: v181CigaretteLicensePaymentInfo;
};

export type v181CigaretteLicensePaymentInfo = {
  token?: string;
  paymentComplete?: boolean;
  orderId?: number;
  orderStatus?: string;
  orderTimestamp?: string;
  confirmationEmailsent?: boolean;
};

export type v181XrayData = {
  facilityDetails?: v181FacilityDetails;
  machines?: v181MachineDetails[];
  status?: v181XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
  lastUpdatedISO?: string;
};

export type v181FacilityDetails = {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  addressZipCode: string;
};

export type v181MachineDetails = {
  name?: string;
  registrationNumber?: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type v181XrayRegistrationStatusResponse = {
  machines: v181MachineDetails[];
  status: v181XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type v181XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

// ---------------- v181 generators ----------------

export const generatev181UserData = (overrides: Partial<v181UserData>): v181UserData => {
  return {
    user: generatev181BusinessUser({}),
    version: 181,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev181Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev181BusinessUser = (
  overrides: Partial<v181BusinessUser>,
): v181BusinessUser => {
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

export const generatev181RoadmapTaskData = (
  overrides: Partial<v181RoadmapTaskData>,
): v181RoadmapTaskData => {
  return {
    manageBusinessVehicles: undefined,
    passengerTransportSchoolBus: undefined,
    passengerTransportSixteenOrMorePassengers: undefined,
    ...overrides,
  };
};

export const generatev181Business = (overrides: Partial<v181Business>): v181Business => {
  const profileData = generatev181ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    dateDeletedISO: "",
    profileData: profileData,
    preferences: generatev181Preferences({}),
    formationData: generatev181FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taxClearanceCertificateData: generatev181TaxClearanceCertificateData({}),
    cigaretteLicenseData: generatev181CigaretteLicenseData({}),
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    roadmapTaskData: generatev181RoadmapTaskData({}),
    licenseData: undefined,
    taxFilingData: generatev181TaxFilingData({}),
    environmentData: undefined,
    xrayRegistrationData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 181,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev181ProfileData = (overrides: Partial<v181ProfileData>): v181ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev181IndustrySpecificData({}),
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

export const generatev181IndustrySpecificData = (
  overrides: Partial<v181IndustrySpecificData>,
): v181IndustrySpecificData => {
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
    carnivalRideOwningBusiness: undefined,
    propertyLeaseType: undefined,
    hasThreeOrMoreRentalUnits: undefined,
    travelingCircusOrCarnivalOwningBusiness: undefined,
    vacantPropertyOwner: undefined,
    publicWorksContractor: undefined,
    ...overrides,
  };
};

export const generatev181Preferences = (overrides: Partial<v181Preferences>): v181Preferences => {
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

export const generatev181FormationData = (
  overrides: Partial<v181FormationData>,
  legalStructureId: string,
): v181FormationData => {
  return {
    formationFormData: generatev181FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev181FormationFormData = (
  overrides: Partial<v181FormationFormData>,
  legalStructureId: string,
): v181FormationFormData => {
  const isCorp = legalStructureId
    ? ["s-corporation", "c-corporation"].includes(legalStructureId)
    : false;

  return <v181FormationFormData>{
    businessName: `some-business-name-${randomInt()}`,
    businessNameConfirmation: true,
    businessSuffix: "LLC",
    businessTotalStock: isCorp ? randomInt().toString() : "",
    businessStartDate: new Date(Date.now()).toISOString().split("T")[0],
    businessPurpose: `some-purpose-${randomInt()}`,
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    addressCity: `some-members-address-city-${randomInt()}`,
    addressState: { shortCode: "123", name: "new-jersey" },
    addressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    addressCountry: `some-county`,
    addressMunicipality: generatev181Municipality({}),
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
    agentNumberOrManual: randomInt() % 2 ? "NUMBER" : "MANUAL_ENTRY",
    agentNumber: `some-agent-number-${randomInt()}`,
    agentName: `some-agent-name-${randomInt()}`,
    agentEmail: `some-agent-email-${randomInt()}`,
    agentOfficeAddressLine1: `some-agent-office-address-1-${randomInt()}`,
    agentOfficeAddressLine2: `some-agent-office-address-2-${randomInt()}`,
    agentOfficeAddressCity: `some-agent-office-address-city-${randomInt()}`,
    agentOfficeAddressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    agentUseAccountInfo: !!(randomInt() % 2),
    agentUseBusinessAddress: !!(randomInt() % 2),
    signers: [],
    members:
      legalStructureId === "limited-liability-partnership" ? [] : [generatev181FormationMember({})],
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

export const generatev181Municipality = (
  overrides: Partial<v181Municipality>,
): v181Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev181FormationMember = (
  overrides: Partial<v181FormationMember>,
): v181FormationMember => {
  return {
    name: `some-name`,
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    addressCity: `some-members-address-city-${randomInt()}`,
    addressState: { shortCode: "123", name: "new-jersey" },
    addressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    addressCountry: `some-county`,
    businessLocationType: undefined,
    ...overrides,
  };
};

export const generatev181TaxFilingData = (
  overrides: Partial<v181TaxFilingData>,
): v181TaxFilingData => {
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

export const generatev181LicenseDetails = (
  overrides: Partial<v181LicenseDetails>,
): v181LicenseDetails => {
  return {
    nameAndAddress: generatev181LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv181LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev181LicenseStatusItem()],
    ...overrides,
  };
};

const generatev181LicenseSearchNameAndAddress = (
  overrides: Partial<v181LicenseSearchNameAndAddress>,
): v181LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev181LicenseStatusItem = (): v181LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv181LicenseStatus = (): v181LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v181LicenseStatuses.length);
  return v181LicenseStatuses[randomIndex];
};

export const generatev181TaxClearanceCertificateData = (
  overrides: Partial<v181TaxClearanceCertificateData>,
): v181TaxClearanceCertificateData => {
  return {
    requestingAgencyId: "",
    businessName: `some-business-name-${randomInt()}`,
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressCity: `some-city-${randomInt()}`,
    addressState: undefined,
    addressZipCode: randomInt(5).toString(),
    taxId: `${randomInt(12)}`,
    taxPin: randomInt(4).toString(),
    hasPreviouslyReceivedCertificate: undefined,
    lastUpdatedISO: "",
    ...overrides,
  };
};

export const generatev181CigaretteLicenseData = (
  overrides: Partial<v181CigaretteLicenseData>,
): v181CigaretteLicenseData => {
  const taxId = randomInt(12).toString();
  const maskingCharacter = "*";
  return {
    businessName: `some-business-name-${randomInt()}`,
    responsibleOwnerName: `some-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    taxId: maskingCharacter.repeat(7) + taxId.slice(-5),
    encryptedTaxId: `encrypted-${taxId}`,
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressCity: `some-city-${randomInt()}`,
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

export const generatev181EnvironmentQuestionnaireData = ({
  airOverrides,
  landOverrides,
  wasteOverrides,
  drinkingWaterOverrides,
  wasteWaterOverrides,
}: {
  airOverrides?: Partial<v181AirData>;
  landOverrides?: Partial<v181LandData>;
  wasteOverrides?: Partial<v181WasteData>;
  drinkingWaterOverrides?: Partial<v181DrinkingWaterData>;
  wasteWaterOverrides?: Partial<v181WasteWaterData>;
}): v181QuestionnaireData => {
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

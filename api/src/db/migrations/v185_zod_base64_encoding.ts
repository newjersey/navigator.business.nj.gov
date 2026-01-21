import {
  v184Business,
  v184BusinessUser,
  v184UserData,
} from "@db/migrations/v184_change_addresscountry_interstatetransport";
import { randomInt } from "@shared/intHelpers";

export const migrate_v184_to_v185 = (userData: v184UserData): v185UserData => {
  return {
    ...userData,
    user: migrate_v184BusinessUser_to_v185BusinessUser(userData.user),
    businesses: Object.fromEntries(
      Object.values(userData.businesses)
        .map((business: v184Business) => migrate_v184Business_to_v185Business(business))
        .map((currBusiness: v185Business) => [currBusiness.id, currBusiness]),
    ),
    version: 185,
  };
};

const migrate_v184BusinessUser_to_v185BusinessUser = (user: v184BusinessUser): v185BusinessUser => {
  return {
    ...user,
  };
};

const migrate_v184Business_to_v185Business = (business: v184Business): v185Business => {
  return {
    ...business,
    version: 185,
  };
};

export interface v185IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness?: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v185CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v185CarServiceType | undefined;
  interstateTransport: boolean | undefined;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v185ConstructionType;
  residentialConstructionType: v185ResidentialConstructionType;
  employmentPersonnelServiceType: v185EmploymentAndPersonnelServicesType;
  employmentPlacementType: v185EmploymentPlacementType;
  propertyLeaseType: v185PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  publicWorksContractor: boolean | undefined;
}

export type v185PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v185 types ----------------
type v185TaskProgress = "TO_DO" | "COMPLETED";
type v185OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v185ABExperience = "ExperienceA" | "ExperienceB";

export interface v185UserData {
  user: v185BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v185Business>;
  currentBusinessId: string;
}

export interface v185Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  dateDeletedISO: string;
  profileData: v185ProfileData;
  onboardingFormProgress: v185OnboardingFormProgress;
  taskProgress: Record<string, v185TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v185LicenseData | undefined;
  preferences: v185Preferences;
  taxFilingData: v185TaxFilingData;
  formationData: v185FormationData;
  environmentData: v185EnvironmentData | undefined;
  xrayRegistrationData: v185XrayData | undefined;
  roadmapTaskData: v185RoadmapTaskData;
  taxClearanceCertificateData: v185TaxClearanceCertificateData | undefined;
  cigaretteLicenseData: v185CigaretteLicenseData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v185RoadmapTaskData {
  manageBusinessVehicles?: boolean;
  passengerTransportSchoolBus?: boolean;
  passengerTransportSixteenOrMorePassengers?: boolean;
}

export interface v185ProfileData extends v185IndustrySpecificData {
  businessPersona: v185BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v185Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  hashedTaxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v185ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v185ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v185OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v185CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
  employerAccessRegistration: boolean | undefined;
  deptOfLaborEin: string;
}

export type v185CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v185Municipality;
};

export type v185BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  receiveUpdatesAndReminders: boolean;
  externalStatus: v185ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v185ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
  phoneNumber?: string;
};

export interface v185ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v185BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v185OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v185CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v185CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v185ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v185ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v185EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v185EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v185ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

export type v185Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v185TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v185TaxFilingErrorFields = "businessName" | "formFailure";

export type v185TaxFilingData = {
  state?: v185TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v185TaxFilingErrorFields;
  businessName?: string;
  filings: v185TaxFilingCalendarEvent[];
};

export type v185CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v185TaxFilingCalendarEvent extends v185CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v185LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v185LicenseSearchNameAndAddress extends v185LicenseSearchAddress {
  name: string;
}

export type v185LicenseDetails = {
  nameAndAddress: v185LicenseSearchNameAndAddress;
  licenseStatus: v185LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v185LicenseStatusItem[];
};

const v185taskIdLicenseNameMapping = {
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

type v185LicenseTaskID = keyof typeof v185taskIdLicenseNameMapping;

export type v185LicenseName = (typeof v185taskIdLicenseNameMapping)[v185LicenseTaskID];

type v185Licenses = Partial<Record<v185LicenseName, v185LicenseDetails>>;

export type v185LicenseData = {
  lastUpdatedISO: string;
  licenses?: v185Licenses;
};

export type v185Preferences = {
  roadmapOpenSections: v185SectionType[];
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

export type v185LicenseStatusItem = {
  title: string;
  status: v185CheckoffStatus;
};

type v185CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v185LicenseStatus =
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

const v185LicenseStatuses: v185LicenseStatus[] = [
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

const v185SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
export type v185SectionType = (typeof v185SectionNames)[number];

export type v185ExternalStatus = {
  newsletter?: v185NewsletterResponse;
  userTesting?: v185UserTestingResponse;
};

export interface v185NewsletterResponse {
  success?: boolean;
  status: v185NewsletterStatus;
}

export interface v185UserTestingResponse {
  success?: boolean;
  status: v185UserTestingStatus;
}

type v185NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v185UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v185NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

export interface v185NameAvailabilityResponse {
  status: v185NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

export interface v185NameAvailability extends v185NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

export interface v185FormationData {
  formationFormData: v185FormationFormData;
  businessNameAvailability: v185NameAvailability | undefined;
  dbaBusinessNameAvailability: v185NameAvailability | undefined;
  formationResponse: v185FormationSubmitResponse | undefined;
  getFilingResponse: v185GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v185InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;
type v185HowToProceedOptions = "DIFFERENT_NAME" | "KEEP_NAME" | "CANCEL_NAME";

export interface v185FormationFormData extends v185FormationAddress {
  readonly businessName: string;
  readonly businessNameConfirmation: boolean;
  readonly businessSuffix: v185BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v185InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v185InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v185InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v185InFormInBylaws;
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
  readonly members: v185FormationMember[] | undefined;
  readonly incorporators: v185FormationIncorporator[] | undefined;
  readonly signers: v185FormationSigner[] | undefined;
  readonly paymentType: v185PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v185StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v185ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
  readonly checkNameReservation: boolean;
  readonly howToProceed: v185HowToProceedOptions;
}

export type v185ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

export type v185StateObject = {
  shortCode: string;
  name: string;
};

export interface v185FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v185StateObject;
  readonly addressMunicipality?: v185Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry?: string;
  readonly businessLocationType: v185FormationBusinessLocationType | undefined;
}

type v185FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v185SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

export interface v185FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v185SignerTitle;
}

export interface v185FormationIncorporator extends v185FormationSigner, v185FormationAddress {}

export interface v185FormationMember extends v185FormationAddress {
  readonly name: string;
}

type v185PaymentType = "CC" | "ACH" | undefined;

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

type v185BusinessSuffix = (typeof AllBusinessSuffixes)[number];

export type v185FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v185FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

export type v185FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

export type v185GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export interface v185EnvironmentData {
  questionnaireData?: v185QuestionnaireData;
  submitted?: boolean;
  emailSent?: boolean;
}

export type v185QuestionnaireData = {
  air: v185AirData;
  land: v185LandData;
  waste: v185WasteData;
  drinkingWater: v185DrinkingWaterData;
  wasteWater: v185WasteWaterData;
};

export type v185AirFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v185AirData = Record<v185AirFieldIds, boolean>;

export type v185LandFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v185LandData = Record<v185LandFieldIds, boolean>;

export type v185WasteFieldIds =
  | "transportWaste"
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v185WasteData = Record<v185WasteFieldIds, boolean>;

export type v185DrinkingWaterFieldIds =
  | "ownWell"
  | "combinedWellCapacity"
  | "wellDrilled"
  | "potableWater"
  | "noDrinkingWater";

export type v185DrinkingWaterData = Record<v185DrinkingWaterFieldIds, boolean>;

export type v185WasteWaterFieldIds =
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

export type v185WasteWaterData = Record<v185WasteWaterFieldIds, boolean>;

export type v185TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: v185StateObject | undefined;
  addressZipCode?: string | undefined;
  taxId: string | undefined;
  taxPin: string | undefined;
  hasPreviouslyReceivedCertificate: boolean | undefined;
  lastUpdatedISO: string | undefined;
};

export type v185CigaretteLicenseData = {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId?: string;
  encryptedTaxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: v185StateObject;
  addressZipCode?: string;
  mailingAddressIsTheSame?: boolean;
  mailingAddressLine1?: string;
  mailingAddressLine2?: string;
  mailingAddressCity?: string;
  mailingAddressState?: v185StateObject;
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
  paymentInfo?: v185CigaretteLicensePaymentInfo;
};

export type v185CigaretteLicensePaymentInfo = {
  token?: string;
  paymentComplete?: boolean;
  orderId?: number;
  orderStatus?: string;
  orderTimestamp?: string;
  confirmationEmailsent?: boolean;
};

export type v185XrayData = {
  facilityDetails?: v185FacilityDetails;
  machines?: v185MachineDetails[];
  status?: v185XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
  lastUpdatedISO?: string;
};

export type v185FacilityDetails = {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  addressZipCode: string;
};

export type v185MachineDetails = {
  name?: string;
  registrationNumber?: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type v185XrayRegistrationStatusResponse = {
  machines: v185MachineDetails[];
  status: v185XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type v185XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

// ---------------- v185 generators ----------------

export const generatev185UserData = (overrides: Partial<v185UserData>): v185UserData => {
  return {
    user: generatev185BusinessUser({}),
    version: 185,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev185Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev185BusinessUser = (
  overrides: Partial<v185BusinessUser>,
): v185BusinessUser => {
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

export const generatev185RoadmapTaskData = (
  overrides: Partial<v185RoadmapTaskData>,
): v185RoadmapTaskData => {
  return {
    manageBusinessVehicles: undefined,
    passengerTransportSchoolBus: undefined,
    passengerTransportSixteenOrMorePassengers: undefined,
    ...overrides,
  };
};

export const generatev185Business = (overrides: Partial<v185Business>): v185Business => {
  const profileData = generatev185ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    dateDeletedISO: "",
    profileData: profileData,
    preferences: generatev185Preferences({}),
    formationData: generatev185FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taxClearanceCertificateData: generatev185TaxClearanceCertificateData({}),
    cigaretteLicenseData: generatev185CigaretteLicenseData({}),
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    roadmapTaskData: generatev185RoadmapTaskData({}),
    licenseData: undefined,
    taxFilingData: generatev185TaxFilingData({}),
    environmentData: undefined,
    xrayRegistrationData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 181,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev185ProfileData = (overrides: Partial<v185ProfileData>): v185ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev185IndustrySpecificData({}),
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

export const generatev185IndustrySpecificData = (
  overrides: Partial<v185IndustrySpecificData>,
): v185IndustrySpecificData => {
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

export const generatev185Preferences = (overrides: Partial<v185Preferences>): v185Preferences => {
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

export const generatev185FormationData = (
  overrides: Partial<v185FormationData>,
  legalStructureId: string,
): v185FormationData => {
  return {
    formationFormData: generatev185FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev185FormationFormData = (
  overrides: Partial<v185FormationFormData>,
  legalStructureId: string,
): v185FormationFormData => {
  const isCorp = legalStructureId
    ? ["s-corporation", "c-corporation"].includes(legalStructureId)
    : false;

  return <v185FormationFormData>{
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
    addressMunicipality: generatev185Municipality({}),
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
      legalStructureId === "limited-liability-partnership" ? [] : [generatev185FormationMember({})],
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

export const generatev185Municipality = (
  overrides: Partial<v185Municipality>,
): v185Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev185FormationMember = (
  overrides: Partial<v185FormationMember>,
): v185FormationMember => {
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

export const generatev185TaxFilingData = (
  overrides: Partial<v185TaxFilingData>,
): v185TaxFilingData => {
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

export const generatev185LicenseDetails = (
  overrides: Partial<v185LicenseDetails>,
): v185LicenseDetails => {
  return {
    nameAndAddress: generatev185LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv185LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev185LicenseStatusItem()],
    ...overrides,
  };
};

const generatev185LicenseSearchNameAndAddress = (
  overrides: Partial<v185LicenseSearchNameAndAddress>,
): v185LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev185LicenseStatusItem = (): v185LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv185LicenseStatus = (): v185LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v185LicenseStatuses.length);
  return v185LicenseStatuses[randomIndex];
};

export const generatev185TaxClearanceCertificateData = (
  overrides: Partial<v185TaxClearanceCertificateData>,
): v185TaxClearanceCertificateData => {
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

export const generatev185CigaretteLicenseData = (
  overrides: Partial<v185CigaretteLicenseData>,
): v185CigaretteLicenseData => {
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

export const generatev185EnvironmentQuestionnaireData = ({
  airOverrides,
  landOverrides,
  wasteOverrides,
  drinkingWaterOverrides,
  wasteWaterOverrides,
}: {
  airOverrides?: Partial<v185AirData>;
  landOverrides?: Partial<v185LandData>;
  wasteOverrides?: Partial<v185WasteData>;
  drinkingWaterOverrides?: Partial<v185DrinkingWaterData>;
  wasteWaterOverrides?: Partial<v185WasteWaterData>;
}): v185QuestionnaireData => {
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

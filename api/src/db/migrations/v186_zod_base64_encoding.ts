import {
  v185Business,
  v185BusinessUser,
  v185UserData,
} from "@db/migrations/v185_zod_base64_encoding";
import { randomInt } from "@shared/intHelpers";

export const migrate_v185_to_v186 = (userData: v185UserData): v186UserData => {
  return {
    ...userData,
    user: migrate_v185BusinessUser_to_v186BusinessUser(userData.user),
    businesses: Object.fromEntries(
      Object.values(userData.businesses)
        .map((business: v185Business) => migrate_v185Business_to_v186Business(business))
        .map((currBusiness: v186Business) => [currBusiness.id, currBusiness]),
    ),
    version: 186,
  };
};

const migrate_v185BusinessUser_to_v186BusinessUser = (user: v185BusinessUser): v186BusinessUser => {
  return {
    ...user,
  };
};

const migrate_v185Business_to_v186Business = (business: v185Business): v186Business => {
  return {
    ...business,
    version: 186,
  };
};

export interface v186IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness?: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v186CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v186CarServiceType | undefined;
  interstateTransport: boolean | undefined;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v186ConstructionType;
  residentialConstructionType: v186ResidentialConstructionType;
  employmentPersonnelServiceType: v186EmploymentAndPersonnelServicesType;
  employmentPlacementType: v186EmploymentPlacementType;
  propertyLeaseType: v186PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  publicWorksContractor: boolean | undefined;
}

export type v186PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v186 types ----------------
type v186TaskProgress = "TO_DO" | "COMPLETED";
type v186OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v186ABExperience = "ExperienceA" | "ExperienceB";

export interface v186UserData {
  user: v186BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v186Business>;
  currentBusinessId: string;
}

export interface v186Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  dateDeletedISO: string;
  profileData: v186ProfileData;
  onboardingFormProgress: v186OnboardingFormProgress;
  taskProgress: Record<string, v186TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v186LicenseData | undefined;
  preferences: v186Preferences;
  taxFilingData: v186TaxFilingData;
  formationData: v186FormationData;
  environmentData: v186EnvironmentData | undefined;
  xrayRegistrationData: v186XrayData | undefined;
  roadmapTaskData: v186RoadmapTaskData;
  taxClearanceCertificateData: v186TaxClearanceCertificateData | undefined;
  cigaretteLicenseData: v186CigaretteLicenseData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v186RoadmapTaskData {
  manageBusinessVehicles?: boolean;
  passengerTransportSchoolBus?: boolean;
  passengerTransportSixteenOrMorePassengers?: boolean;
}

export interface v186ProfileData extends v186IndustrySpecificData {
  businessPersona: v186BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v186Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  hashedTaxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v186ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v186ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v186OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v186CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
  employerAccessRegistration: boolean | undefined;
  deptOfLaborEin: string;
}

export type v186CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v186Municipality;
};

export type v186BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  receiveUpdatesAndReminders: boolean;
  externalStatus: v186ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v186ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
  phoneNumber?: string;
};

export interface v186ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v186BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v186OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v186CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v186CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v186ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v186ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v186EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v186EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v186ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

export type v186Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v186TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v186TaxFilingErrorFields = "businessName" | "formFailure";

export type v186TaxFilingData = {
  state?: v186TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v186TaxFilingErrorFields;
  businessName?: string;
  filings: v186TaxFilingCalendarEvent[];
};

export type v186CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v186TaxFilingCalendarEvent extends v186CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v186LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v186LicenseSearchNameAndAddress extends v186LicenseSearchAddress {
  name: string;
}

export type v186LicenseDetails = {
  nameAndAddress: v186LicenseSearchNameAndAddress;
  licenseStatus: v186LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v186LicenseStatusItem[];
};

const v186taskIdLicenseNameMapping = {
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

type v186LicenseTaskID = keyof typeof v186taskIdLicenseNameMapping;

export type v186LicenseName = (typeof v186taskIdLicenseNameMapping)[v186LicenseTaskID];

type v186Licenses = Partial<Record<v186LicenseName, v186LicenseDetails>>;

export type v186LicenseData = {
  lastUpdatedISO: string;
  licenses?: v186Licenses;
};

export type v186Preferences = {
  roadmapOpenSections: v186SectionType[];
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

export type v186LicenseStatusItem = {
  title: string;
  status: v186CheckoffStatus;
};

type v186CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v186LicenseStatus =
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

const v186LicenseStatuses: v186LicenseStatus[] = [
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

const v186SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
export type v186SectionType = (typeof v186SectionNames)[number];

export type v186ExternalStatus = {
  newsletter?: v186NewsletterResponse;
  userTesting?: v186UserTestingResponse;
};

export interface v186NewsletterResponse {
  success?: boolean;
  status: v186NewsletterStatus;
}

export interface v186UserTestingResponse {
  success?: boolean;
  status: v186UserTestingStatus;
}

type v186NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v186UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v186NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

export interface v186NameAvailabilityResponse {
  status: v186NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

export interface v186NameAvailability extends v186NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

export interface v186FormationData {
  formationFormData: v186FormationFormData;
  businessNameAvailability: v186NameAvailability | undefined;
  dbaBusinessNameAvailability: v186NameAvailability | undefined;
  formationResponse: v186FormationSubmitResponse | undefined;
  getFilingResponse: v186GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v186InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;
type v186HowToProceedOptions = "DIFFERENT_NAME" | "KEEP_NAME" | "CANCEL_NAME";

export interface v186FormationFormData extends v186FormationAddress {
  readonly businessName: string;
  readonly businessNameConfirmation: boolean;
  readonly businessSuffix: v186BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v186InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v186InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v186InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v186InFormInBylaws;
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
  readonly members: v186FormationMember[] | undefined;
  readonly incorporators: v186FormationIncorporator[] | undefined;
  readonly signers: v186FormationSigner[] | undefined;
  readonly paymentType: v186PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v186StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v186ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
  readonly checkNameReservation: boolean;
  readonly howToProceed: v186HowToProceedOptions;
}

export type v186ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

export type v186StateObject = {
  shortCode: string;
  name: string;
};

export interface v186FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v186StateObject;
  readonly addressMunicipality?: v186Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry?: string;
  readonly businessLocationType: v186FormationBusinessLocationType | undefined;
}

type v186FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v186SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

export interface v186FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v186SignerTitle;
}

export interface v186FormationIncorporator extends v186FormationSigner, v186FormationAddress {}

export interface v186FormationMember extends v186FormationAddress {
  readonly name: string;
}

type v186PaymentType = "CC" | "ACH" | undefined;

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

type v186BusinessSuffix = (typeof AllBusinessSuffixes)[number];

export type v186FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v186FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

export type v186FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

export type v186GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export interface v186EnvironmentData {
  questionnaireData?: v186QuestionnaireData;
  submitted?: boolean;
  emailSent?: boolean;
}

export type v186QuestionnaireData = {
  air: v186AirData;
  land: v186LandData;
  waste: v186WasteData;
  drinkingWater: v186DrinkingWaterData;
  wasteWater: v186WasteWaterData;
};

export type v186AirFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v186AirData = Record<v186AirFieldIds, boolean>;

export type v186LandFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v186LandData = Record<v186LandFieldIds, boolean>;

export type v186WasteFieldIds =
  | "transportWaste"
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v186WasteData = Record<v186WasteFieldIds, boolean>;

export type v186DrinkingWaterFieldIds =
  | "ownWell"
  | "combinedWellCapacity"
  | "wellDrilled"
  | "potableWater"
  | "noDrinkingWater";

export type v186DrinkingWaterData = Record<v186DrinkingWaterFieldIds, boolean>;

export type v186WasteWaterFieldIds =
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

export type v186WasteWaterData = Record<v186WasteWaterFieldIds, boolean>;

export type v186TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: v186StateObject | undefined;
  addressZipCode?: string | undefined;
  taxId: string | undefined;
  taxPin: string | undefined;
  hasPreviouslyReceivedCertificate: boolean | undefined;
  lastUpdatedISO: string | undefined;
};

export type v186CigaretteLicenseData = {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId?: string;
  encryptedTaxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: v186StateObject;
  addressZipCode?: string;
  mailingAddressIsTheSame?: boolean;
  mailingAddressLine1?: string;
  mailingAddressLine2?: string;
  mailingAddressCity?: string;
  mailingAddressState?: v186StateObject;
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
  paymentInfo?: v186CigaretteLicensePaymentInfo;
};

export type v186CigaretteLicensePaymentInfo = {
  token?: string;
  paymentComplete?: boolean;
  orderId?: number;
  orderStatus?: string;
  orderTimestamp?: string;
  confirmationEmailsent?: boolean;
};

export type v186XrayData = {
  facilityDetails?: v186FacilityDetails;
  machines?: v186MachineDetails[];
  status?: v186XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
  lastUpdatedISO?: string;
};

export type v186FacilityDetails = {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  addressZipCode: string;
};

export type v186MachineDetails = {
  name?: string;
  registrationNumber?: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type v186XrayRegistrationStatusResponse = {
  machines: v186MachineDetails[];
  status: v186XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type v186XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

// ---------------- v186 generators ----------------

export const generatev186UserData = (overrides: Partial<v186UserData>): v186UserData => {
  return {
    user: generatev186BusinessUser({}),
    version: 186,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev186Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev186BusinessUser = (
  overrides: Partial<v186BusinessUser>,
): v186BusinessUser => {
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

export const generatev186RoadmapTaskData = (
  overrides: Partial<v186RoadmapTaskData>,
): v186RoadmapTaskData => {
  return {
    manageBusinessVehicles: undefined,
    passengerTransportSchoolBus: undefined,
    passengerTransportSixteenOrMorePassengers: undefined,
    ...overrides,
  };
};

export const generatev186Business = (overrides: Partial<v186Business>): v186Business => {
  const profileData = generatev186ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    dateDeletedISO: "",
    profileData: profileData,
    preferences: generatev186Preferences({}),
    formationData: generatev186FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taxClearanceCertificateData: generatev186TaxClearanceCertificateData({}),
    cigaretteLicenseData: generatev186CigaretteLicenseData({}),
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    roadmapTaskData: generatev186RoadmapTaskData({}),
    licenseData: undefined,
    taxFilingData: generatev186TaxFilingData({}),
    environmentData: undefined,
    xrayRegistrationData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 181,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev186ProfileData = (overrides: Partial<v186ProfileData>): v186ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev186IndustrySpecificData({}),
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

export const generatev186IndustrySpecificData = (
  overrides: Partial<v186IndustrySpecificData>,
): v186IndustrySpecificData => {
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

export const generatev186Preferences = (overrides: Partial<v186Preferences>): v186Preferences => {
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

export const generatev186FormationData = (
  overrides: Partial<v186FormationData>,
  legalStructureId: string,
): v186FormationData => {
  return {
    formationFormData: generatev186FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev186FormationFormData = (
  overrides: Partial<v186FormationFormData>,
  legalStructureId: string,
): v186FormationFormData => {
  const isCorp = legalStructureId
    ? ["s-corporation", "c-corporation"].includes(legalStructureId)
    : false;

  return <v186FormationFormData>{
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
    addressMunicipality: generatev186Municipality({}),
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
      legalStructureId === "limited-liability-partnership" ? [] : [generatev186FormationMember({})],
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

export const generatev186Municipality = (
  overrides: Partial<v186Municipality>,
): v186Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev186FormationMember = (
  overrides: Partial<v186FormationMember>,
): v186FormationMember => {
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

export const generatev186TaxFilingData = (
  overrides: Partial<v186TaxFilingData>,
): v186TaxFilingData => {
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

export const generatev186LicenseDetails = (
  overrides: Partial<v186LicenseDetails>,
): v186LicenseDetails => {
  return {
    nameAndAddress: generatev186LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv186LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev186LicenseStatusItem()],
    ...overrides,
  };
};

const generatev186LicenseSearchNameAndAddress = (
  overrides: Partial<v186LicenseSearchNameAndAddress>,
): v186LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev186LicenseStatusItem = (): v186LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv186LicenseStatus = (): v186LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v186LicenseStatuses.length);
  return v186LicenseStatuses[randomIndex];
};

export const generatev186TaxClearanceCertificateData = (
  overrides: Partial<v186TaxClearanceCertificateData>,
): v186TaxClearanceCertificateData => {
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

export const generatev186CigaretteLicenseData = (
  overrides: Partial<v186CigaretteLicenseData>,
): v186CigaretteLicenseData => {
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

export const generatev186EnvironmentQuestionnaireData = ({
  airOverrides,
  landOverrides,
  wasteOverrides,
  drinkingWaterOverrides,
  wasteWaterOverrides,
}: {
  airOverrides?: Partial<v186AirData>;
  landOverrides?: Partial<v186LandData>;
  wasteOverrides?: Partial<v186WasteData>;
  drinkingWaterOverrides?: Partial<v186DrinkingWaterData>;
  wasteWaterOverrides?: Partial<v186WasteWaterData>;
}): v186QuestionnaireData => {
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

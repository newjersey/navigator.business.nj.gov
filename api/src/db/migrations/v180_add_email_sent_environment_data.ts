import { v179Business, v179UserData } from "@db/migrations/v179_add_business_deletion_date";
import { randomInt } from "@shared/intHelpers";

export const migrate_v179_to_v180 = (userData: v179UserData): v180UserData => {
  return {
    ...userData,
    businesses: Object.fromEntries(
      Object.values(userData.businesses)
        .map((business: v179Business) => migrate_v179Business_to_v180Business(business))
        .map((currBusiness: v180Business) => [currBusiness.id, currBusiness]),
    ),
    version: 180,
  };
};

const migrate_v179Business_to_v180Business = (business: v179Business): v180Business => {
  return {
    ...business,
    version: 180,
    environmentData: {
      ...business.environmentData,
      emailSent: false,
    },
  };
};

export interface v180IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v180CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v180CarServiceType | undefined;
  interstateTransport: boolean;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v180ConstructionType;
  residentialConstructionType: v180ResidentialConstructionType;
  employmentPersonnelServiceType: v180EmploymentAndPersonnelServicesType;
  employmentPlacementType: v180EmploymentPlacementType;
  carnivalRideOwningBusiness: boolean | undefined;
  propertyLeaseType: v180PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  travelingCircusOrCarnivalOwningBusiness: boolean | undefined;
  vacantPropertyOwner: boolean | undefined;
  publicWorksContractor: boolean | undefined;
}

export type v180PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v180 types ----------------
type v180TaskProgress = "TO_DO" | "COMPLETED";
type v180OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v180ABExperience = "ExperienceA" | "ExperienceB";

export interface v180UserData {
  user: v180BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v180Business>;
  currentBusinessId: string;
}

export interface v180Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  dateDeletedISO: string;
  profileData: v180ProfileData;
  onboardingFormProgress: v180OnboardingFormProgress;
  taskProgress: Record<string, v180TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v180LicenseData | undefined;
  preferences: v180Preferences;
  taxFilingData: v180TaxFilingData;
  formationData: v180FormationData;
  environmentData: v180EnvironmentData | undefined;
  xrayRegistrationData: v180XrayData | undefined;
  roadmapTaskData: v180RoadmapTaskData;
  taxClearanceCertificateData: v180TaxClearanceCertificateData | undefined;
  cigaretteLicenseData: v180CigaretteLicenseData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v180RoadmapTaskData {
  manageBusinessVehicles?: boolean;
  passengerTransportSchoolBus?: boolean;
  passengerTransportSixteenOrMorePassengers?: boolean;
}

export interface v180ProfileData extends v180IndustrySpecificData {
  businessPersona: v180BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v180Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  hashedTaxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v180ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v180ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v180OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v180CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
  employerAccessRegistration: boolean | undefined;
  deptOfLaborEin: string;
}

export type v180CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v180Municipality;
};

type v180BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v180ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v180ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
};

interface v180ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v180BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v180OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v180CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v180CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v180ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v180ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v180EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v180EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v180ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v180Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v180TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v180TaxFilingErrorFields = "businessName" | "formFailure";

type v180TaxFilingData = {
  state?: v180TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v180TaxFilingErrorFields;
  businessName?: string;
  filings: v180TaxFilingCalendarEvent[];
};

export type v180CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v180TaxFilingCalendarEvent extends v180CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v180LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v180LicenseSearchNameAndAddress extends v180LicenseSearchAddress {
  name: string;
}

type v180LicenseDetails = {
  nameAndAddress: v180LicenseSearchNameAndAddress;
  licenseStatus: v180LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v180LicenseStatusItem[];
};

const v180taskIdLicenseNameMapping = {
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

type v180LicenseTaskID = keyof typeof v180taskIdLicenseNameMapping;

export type v180LicenseName = (typeof v180taskIdLicenseNameMapping)[v180LicenseTaskID];

type v180Licenses = Partial<Record<v180LicenseName, v180LicenseDetails>>;

type v180LicenseData = {
  lastUpdatedISO: string;
  licenses?: v180Licenses;
};

type v180Preferences = {
  roadmapOpenSections: v180SectionType[];
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

type v180LicenseStatusItem = {
  title: string;
  status: v180CheckoffStatus;
};

type v180CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v180LicenseStatus =
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

const v180LicenseStatuses: v180LicenseStatus[] = [
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

const v180SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
type v180SectionType = (typeof v180SectionNames)[number];

type v180ExternalStatus = {
  newsletter?: v180NewsletterResponse;
  userTesting?: v180UserTestingResponse;
};

interface v180NewsletterResponse {
  success?: boolean;
  status: v180NewsletterStatus;
}

interface v180UserTestingResponse {
  success?: boolean;
  status: v180UserTestingStatus;
}

type v180NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v180UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v180NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v180NameAvailabilityResponse {
  status: v180NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v180NameAvailability extends v180NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

export interface v180FormationData {
  formationFormData: v180FormationFormData;
  businessNameAvailability: v180NameAvailability | undefined;
  dbaBusinessNameAvailability: v180NameAvailability | undefined;
  formationResponse: v180FormationSubmitResponse | undefined;
  getFilingResponse: v180GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v180InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;
type v180HowToProceedOptions = "DIFFERENT_NAME" | "KEEP_NAME" | "CANCEL_NAME";

export interface v180FormationFormData extends v180FormationAddress {
  readonly businessName: string;
  readonly businessNameConfirmation: boolean;
  readonly businessSuffix: v180BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v180InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v180InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v180InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v180InFormInBylaws;
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
  readonly members: v180FormationMember[] | undefined;
  readonly incorporators: v180FormationIncorporator[] | undefined;
  readonly signers: v180FormationSigner[] | undefined;
  readonly paymentType: v180PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v180StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v180ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
  readonly checkNameReservation: boolean;
  readonly howToProceed: v180HowToProceedOptions;
}

type v180ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v180StateObject = {
  shortCode: string;
  name: string;
};

interface v180FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v180StateObject;
  readonly addressMunicipality?: v180Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v180FormationBusinessLocationType | undefined;
}

type v180FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v180SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v180FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v180SignerTitle;
}

interface v180FormationIncorporator extends v180FormationSigner, v180FormationAddress {}

interface v180FormationMember extends v180FormationAddress {
  readonly name: string;
}

type v180PaymentType = "CC" | "ACH" | undefined;

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

type v180BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v180FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v180FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v180FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v180GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export interface v180EnvironmentData {
  questionnaireData?: v180QuestionnaireData;
  submitted?: boolean;
  emailSent?: boolean;
}

export type v180QuestionnaireData = {
  air: v180AirData;
  land: v180LandData;
  waste: v180WasteData;
  drinkingWater: v180DrinkingWaterData;
  wasteWater: v180WasteWaterData;
};

export type v180AirFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v180AirData = Record<v180AirFieldIds, boolean>;

export type v180LandFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v180LandData = Record<v180LandFieldIds, boolean>;

export type v180WasteFieldIds =
  | "transportWaste"
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v180WasteData = Record<v180WasteFieldIds, boolean>;

export type v180DrinkingWaterFieldIds =
  | "ownWell"
  | "combinedWellCapacity"
  | "wellDrilled"
  | "potableWater"
  | "noDrinkingWater";

export type v180DrinkingWaterData = Record<v180DrinkingWaterFieldIds, boolean>;

export type v180WasteWaterFieldIds =
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

export type v180WasteWaterData = Record<v180WasteWaterFieldIds, boolean>;

export type v180TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: v180StateObject | undefined;
  addressZipCode: string | undefined;
  taxId: string | undefined;
  taxPin: string | undefined;
  hasPreviouslyReceivedCertificate: boolean | undefined;
  lastUpdatedISO: string | undefined;
};

export type v180CigaretteLicenseData = {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId?: string;
  encryptedTaxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: v180StateObject;
  addressZipCode?: string;
  mailingAddressIsTheSame?: boolean;
  mailingAddressLine1?: string;
  mailingAddressLine2?: string;
  mailingAddressCity?: string;
  mailingAddressState?: v180StateObject;
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
  paymentInfo?: v180CigaretteLicensePaymentInfo;
};

export type v180CigaretteLicensePaymentInfo = {
  token?: string;
  paymentComplete?: boolean;
  orderId?: number;
  orderStatus?: string;
  orderTimestamp?: string;
  confirmationEmailsent?: boolean;
};

export type v180XrayData = {
  facilityDetails?: v180FacilityDetails;
  machines?: v180MachineDetails[];
  status?: v180XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
  lastUpdatedISO?: string;
};

export type v180FacilityDetails = {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  addressZipCode: string;
};

export type v180MachineDetails = {
  name?: string;
  registrationNumber?: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type v180XrayRegistrationStatusResponse = {
  machines: v180MachineDetails[];
  status: v180XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type v180XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

// ---------------- v180 generators ----------------

export const generatev180UserData = (overrides: Partial<v180UserData>): v180UserData => {
  return {
    user: generatev180BusinessUser({}),
    version: 180,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev180Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev180BusinessUser = (
  overrides: Partial<v180BusinessUser>,
): v180BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    receiveNewsletter: false,
    userTesting: false,
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
    contactSharingWithAccountCreationPartner: false,
    ...overrides,
  };
};

export const generatev180RoadmapTaskData = (
  overrides: Partial<v180RoadmapTaskData>,
): v180RoadmapTaskData => {
  return {
    manageBusinessVehicles: undefined,
    passengerTransportSchoolBus: undefined,
    passengerTransportSixteenOrMorePassengers: undefined,
    ...overrides,
  };
};

export const generatev180Business = (overrides: Partial<v180Business>): v180Business => {
  const profileData = generatev180ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    dateDeletedISO: "",
    profileData: profileData,
    preferences: generatev180Preferences({}),
    formationData: generatev180FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taxClearanceCertificateData: generatev180TaxClearanceCertificateData({}),
    cigaretteLicenseData: generatev180CigaretteLicenseData({}),
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    roadmapTaskData: generatev180RoadmapTaskData({}),
    licenseData: undefined,
    taxFilingData: generatev180TaxFilingData({}),
    environmentData: undefined,
    xrayRegistrationData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 180,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev180ProfileData = (overrides: Partial<v180ProfileData>): v180ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev180IndustrySpecificData({}),
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

export const generatev180IndustrySpecificData = (
  overrides: Partial<v180IndustrySpecificData>,
): v180IndustrySpecificData => {
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

export const generatev180Preferences = (overrides: Partial<v180Preferences>): v180Preferences => {
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

export const generatev180FormationData = (
  overrides: Partial<v180FormationData>,
  legalStructureId: string,
): v180FormationData => {
  return {
    formationFormData: generatev180FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev180FormationFormData = (
  overrides: Partial<v180FormationFormData>,
  legalStructureId: string,
): v180FormationFormData => {
  const isCorp = legalStructureId
    ? ["s-corporation", "c-corporation"].includes(legalStructureId)
    : false;

  return <v180FormationFormData>{
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
    addressMunicipality: generatev180Municipality({}),
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
      legalStructureId === "limited-liability-partnership" ? [] : [generatev180FormationMember({})],
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

export const generatev180Municipality = (
  overrides: Partial<v180Municipality>,
): v180Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev180FormationMember = (
  overrides: Partial<v180FormationMember>,
): v180FormationMember => {
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

export const generatev180TaxFilingData = (
  overrides: Partial<v180TaxFilingData>,
): v180TaxFilingData => {
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

export const generatev180LicenseDetails = (
  overrides: Partial<v180LicenseDetails>,
): v180LicenseDetails => {
  return {
    nameAndAddress: generatev180LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv180LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev180LicenseStatusItem()],
    ...overrides,
  };
};

const generatev180LicenseSearchNameAndAddress = (
  overrides: Partial<v180LicenseSearchNameAndAddress>,
): v180LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev180LicenseStatusItem = (): v180LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv180LicenseStatus = (): v180LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v180LicenseStatuses.length);
  return v180LicenseStatuses[randomIndex];
};

export const generatev180TaxClearanceCertificateData = (
  overrides: Partial<v180TaxClearanceCertificateData>,
): v180TaxClearanceCertificateData => {
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

export const generatev180CigaretteLicenseData = (
  overrides: Partial<v180CigaretteLicenseData>,
): v180CigaretteLicenseData => {
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

export const generatev180EnvironmentQuestionnaireData = ({
  airOverrides,
  landOverrides,
  wasteOverrides,
  drinkingWaterOverrides,
  wasteWaterOverrides,
}: {
  airOverrides?: Partial<v180AirData>;
  landOverrides?: Partial<v180LandData>;
  wasteOverrides?: Partial<v180WasteData>;
  drinkingWaterOverrides?: Partial<v180DrinkingWaterData>;
  wasteWaterOverrides?: Partial<v180WasteWaterData>;
}): v180QuestionnaireData => {
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

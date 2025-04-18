import { v158Business, v158UserData } from "@db/migrations/v158_login_email_to_lowercase";
import { randomInt } from "@shared/intHelpers";

export const migrate_v158_to_v159 = (v158Data: v158UserData): v159UserData => {
  return {
    ...v158Data,
    businesses: Object.fromEntries(
      Object.values(v158Data.businesses)
        .map((business: v158Business) => migrate_v158Business_to_v159Business(business, v158Data))
        .map((currBusiness: v159Business) => [currBusiness.id, currBusiness])
    ),
    version: 159,
  } as v159UserData;
};

export const migrate_v158Business_to_v159Business = (
  business: v158Business,
  userData: v158UserData
): v159Business => {
  type FOR_MIGRATION_159_ONLY_TaxClearanceCertificateData = {
    requestingAgencyId: string | undefined;
    businessName: string | undefined;
    addressLine1: string | undefined;
    addressLine2: string | undefined;
    addressCity: string | undefined;
    addressState?: v159StateObject;
    addressZipCode: string | undefined;
    entityId: string | undefined;
    taxId: string | undefined;
    taxPin: string | undefined;
  };

  type FOR_MIGRATION_159_ONLY_Business = {
    id: string;
    dateCreatedISO: string;
    lastUpdatedISO: string;
    profileData: v159ProfileData;
    onboardingFormProgress: v159OnboardingFormProgress;
    taskProgress: Record<string, v159TaskProgress>;
    taskItemChecklist: Record<string, boolean>;
    licenseData: v159LicenseData | undefined;
    preferences: v159Preferences;
    taxFilingData: v159TaxFilingData;
    formationData: v159FormationData;
    environmentData: v159EnvironmentData | undefined;
    taxClearanceCertificateData: FOR_MIGRATION_159_ONLY_TaxClearanceCertificateData;
    version: number;
    versionWhenCreated: number;
    userId: string;
  };

  const tempBusiness: FOR_MIGRATION_159_ONLY_Business = {
    ...business,
    version: 159,
    userId: userData.user.id,
  };

  delete tempBusiness.taxClearanceCertificateData.entityId;

  return tempBusiness as v159Business;
};

export interface v159IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v159CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v159CarServiceType | undefined;
  interstateTransport: boolean;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v159ConstructionType;
  residentialConstructionType: v159ResidentialConstructionType;
  employmentPersonnelServiceType: v159EmploymentAndPersonnelServicesType;
  employmentPlacementType: v159EmploymentPlacementType;
  carnivalRideOwningBusiness: boolean | undefined;
  propertyLeaseType: v159PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  travelingCircusOrCarnivalOwningBusiness: boolean | undefined;
  vacantPropertyOwner: boolean | undefined;
}

export type v159PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v159 types ----------------
type v159TaskProgress = "TO_DO" | "COMPLETED";
type v159OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v159ABExperience = "ExperienceA" | "ExperienceB";

export interface v159UserData {
  user: v159BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v159Business>;
  currentBusinessId: string;
}

export interface v159Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v159ProfileData;
  onboardingFormProgress: v159OnboardingFormProgress;
  taskProgress: Record<string, v159TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v159LicenseData | undefined;
  preferences: v159Preferences;
  taxFilingData: v159TaxFilingData;
  formationData: v159FormationData;
  environmentData: v159EnvironmentData | undefined;
  taxClearanceCertificateData: v159TaxClearanceCertificateData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v159ProfileData extends v159IndustrySpecificData {
  businessPersona: v159BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v159Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v159ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v159ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v159OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v159CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
}

export type v159CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v159Municipality;
};

type v159BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v159ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v159ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
};

interface v159ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v159BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v159OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v159CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v159CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v159ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v159ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v159EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v159EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v159ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v159Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v159TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v159TaxFilingErrorFields = "businessName" | "formFailure";

type v159TaxFilingData = {
  state?: v159TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v159TaxFilingErrorFields;
  businessName?: string;
  filings: v159TaxFilingCalendarEvent[];
};

export type v159CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v159TaxFilingCalendarEvent extends v159CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v159LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v159LicenseSearchNameAndAddress extends v159LicenseSearchAddress {
  name: string;
}

type v159LicenseDetails = {
  nameAndAddress: v159LicenseSearchNameAndAddress;
  licenseStatus: v159LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v159LicenseStatusItem[];
};

const v159taskIdLicenseNameMapping = {
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

type v159LicenseTaskID = keyof typeof v159taskIdLicenseNameMapping;

export type v159LicenseName = (typeof v159taskIdLicenseNameMapping)[v159LicenseTaskID];

type v159Licenses = Partial<Record<v159LicenseName, v159LicenseDetails>>;

type v159LicenseData = {
  lastUpdatedISO: string;
  licenses?: v159Licenses;
};

type v159Preferences = {
  roadmapOpenSections: v159SectionType[];
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

type v159LicenseStatusItem = {
  title: string;
  status: v159CheckoffStatus;
};

type v159CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v159LicenseStatus =
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

const v159LicenseStatuses: v159LicenseStatus[] = [
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

const v159SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
type v159SectionType = (typeof v159SectionNames)[number];

type v159ExternalStatus = {
  newsletter?: v159NewsletterResponse;
  userTesting?: v159UserTestingResponse;
};

interface v159NewsletterResponse {
  success?: boolean;
  status: v159NewsletterStatus;
}

interface v159UserTestingResponse {
  success?: boolean;
  status: v159UserTestingStatus;
}

type v159NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v159UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v159NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v159NameAvailabilityResponse {
  status: v159NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v159NameAvailability extends v159NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v159FormationData {
  formationFormData: v159FormationFormData;
  businessNameAvailability: v159NameAvailability | undefined;
  dbaBusinessNameAvailability: v159NameAvailability | undefined;
  formationResponse: v159FormationSubmitResponse | undefined;
  getFilingResponse: v159GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v159InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v159FormationFormData extends v159FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v159BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v159InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v159InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v159InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v159InFormInBylaws;
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
  readonly members: v159FormationMember[] | undefined;
  readonly incorporators: v159FormationIncorporator[] | undefined;
  readonly signers: v159FormationSigner[] | undefined;
  readonly paymentType: v159PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v159StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v159ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v159ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v159StateObject = {
  shortCode: string;
  name: string;
};

interface v159FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v159StateObject;
  readonly addressMunicipality?: v159Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v159FormationBusinessLocationType | undefined;
}

type v159FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v159SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v159FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v159SignerTitle;
}

interface v159FormationIncorporator extends v159FormationSigner, v159FormationAddress {}

interface v159FormationMember extends v159FormationAddress {
  readonly name: string;
}

type v159PaymentType = "CC" | "ACH" | undefined;

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

type v159BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v159FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v159FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v159FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v159GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export type v159EnvironmentData = {
  waste?: v159WasteData;
  land?: v159LandData;
  air?: v159AirData;
};

export type v159MediaArea = keyof v159EnvironmentData;
export type v159QuestionnaireFieldIds =
  | v159WasteQuestionnaireFieldIds
  | v159LandQuestionnaireFieldIds
  | v159AirQuestionnaireFieldIds;
export type v159Questionnaire = Record<v159QuestionnaireFieldIds, boolean>;
export type v159QuestionnaireConfig = Record<v159QuestionnaireFieldIds, string>;

export type v159WasteData = {
  questionnaireData: v159WasteQuestionnaireData;
  submitted: boolean;
};

export type v159WasteQuestionnaireFieldIds =
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v159WasteQuestionnaireData = Record<v159WasteQuestionnaireFieldIds, boolean>;

export type v159LandData = {
  questionnaireData: v159LandQuestionnaireData;
  submitted: boolean;
};

export type v159LandQuestionnaireFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v159LandQuestionnaireData = Record<v159LandQuestionnaireFieldIds, boolean>;

export type v159AirData = {
  questionnaireData: v159AirQuestionnaireData;
  submitted: boolean;
};

export type v159AirQuestionnaireFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v159AirQuestionnaireData = Record<v159AirQuestionnaireFieldIds, boolean>;

export type v159TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: v159StateObject | undefined;
  addressZipCode: string | undefined;
  taxId: string | undefined;
  taxPin: string | undefined;
};

// ---------------- v159 generators ----------------

export const generatev159UserData = (overrides: Partial<v159UserData>): v159UserData => {
  return {
    user: generatev159BusinessUser({}),
    version: 159,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev159Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev159BusinessUser = (overrides: Partial<v159BusinessUser>): v159BusinessUser => {
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

export const generatev159Business = (overrides: Partial<v159Business>): v159Business => {
  const profileData = generatev159ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    profileData: profileData,
    preferences: generatev159Preferences({}),
    formationData: generatev159FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taxClearanceCertificateData: generatev159TaxClearanceCertificateData({}),
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    licenseData: undefined,
    taxFilingData: generatev159TaxFilingData({}),
    environmentData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 159,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev159ProfileData = (overrides: Partial<v159ProfileData>): v159ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev159IndustrySpecificData({}),
    businessPersona: persona,
    businessName: `some-business-name-${randomInt()}`,
    industryId: "restaurant",
    legalStructureId: "limited-liability-partnership",
    dateOfFormation: undefined,
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt() % 2 ? randomInt(9).toString() : randomInt(12).toString(),
    encryptedTaxId: `some-encrypted-value`,
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
    ...overrides,
  };
};

export const generatev159IndustrySpecificData = (
  overrides: Partial<v159IndustrySpecificData>
): v159IndustrySpecificData => {
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
    ...overrides,
  };
};

export const generatev159Preferences = (overrides: Partial<v159Preferences>): v159Preferences => {
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

export const generatev159FormationData = (
  overrides: Partial<v159FormationData>,
  legalStructureId: string
): v159FormationData => {
  return {
    formationFormData: generatev159FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev159FormationFormData = (
  overrides: Partial<v159FormationFormData>,
  legalStructureId: string
): v159FormationFormData => {
  const isCorp = legalStructureId ? ["s-corporation", "c-corporation"].includes(legalStructureId) : false;

  return <v159FormationFormData>{
    businessName: `some-business-name-${randomInt()}`,
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
    addressMunicipality: generatev159Municipality({}),
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
    members: legalStructureId === "limited-liability-partnership" ? [] : [generatev159FormationMember({})],
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
    ...overrides,
  };
};

export const generatev159Municipality = (overrides: Partial<v159Municipality>): v159Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev159FormationMember = (overrides: Partial<v159FormationMember>): v159FormationMember => {
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

export const generatev159TaxFilingData = (overrides: Partial<v159TaxFilingData>): v159TaxFilingData => {
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

export const generatev159LicenseDetails = (overrides: Partial<v159LicenseDetails>): v159LicenseDetails => {
  return {
    nameAndAddress: generatev159LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv159LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev159LicenseStatusItem()],
    ...overrides,
  };
};

const generatev159LicenseSearchNameAndAddress = (
  overrides: Partial<v159LicenseSearchNameAndAddress>
): v159LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev159LicenseStatusItem = (): v159LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv159LicenseStatus = (): v159LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v159LicenseStatuses.length);
  return v159LicenseStatuses[randomIndex];
};

export const generatev159TaxClearanceCertificateData = (
  overrides: Partial<v159TaxClearanceCertificateData>
): v159TaxClearanceCertificateData => {
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
    ...overrides,
  };
};

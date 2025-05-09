import { type MigrationClients } from "@db/migrations/types";
import {
  v155Business,
  v155UserData,
} from "@db/migrations/v155_add_user_id_and_version_to_business";
import { randomInt } from "@shared/intHelpers";

export const migrate_v155_to_v156 = (
  v155Data: v155UserData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _?: MigrationClients,
): v156UserData => {
  return {
    ...v155Data,
    businesses: Object.fromEntries(
      Object.values(v155Data.businesses)
        .map((business: v155Business) => migrate_v155Business_to_v156Business(business, v155Data))
        .map((currBusiness: v156Business) => [currBusiness.id, currBusiness]),
    ),
    version: 156,
  } as v156UserData;
};

export const migrate_v155Business_to_v156Business = (
  business: v155Business,
  userData: v155UserData,
): v156Business => {
  return {
    ...business,
    taskProgress: Object.fromEntries(
      Object.entries(business.taskProgress).map(([taskId, status]) => {
        if (status === "NOT_STARTED" || status === "IN_PROGRESS") {
          return [taskId, "TO_DO"];
        }
        return [taskId, status];
      }),
    ),
    version: 156,
    versionWhenCreated: 156,
    userId: userData.user.id,
  } as v156Business;
};

export interface v156IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v156CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v156CarServiceType | undefined;
  interstateTransport: boolean;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v156ConstructionType;
  residentialConstructionType: v156ResidentialConstructionType;
  employmentPersonnelServiceType: v156EmploymentAndPersonnelServicesType;
  employmentPlacementType: v156EmploymentPlacementType;
  carnivalRideOwningBusiness: boolean | undefined;
  propertyLeaseType: v156PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  travelingCircusOrCarnivalOwningBusiness: boolean | undefined;
  vacantPropertyOwner: boolean | undefined;
}

export type v156PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v156 types ----------------
type v156TaskProgress = "TO_DO" | "COMPLETED";
type v156OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v156ABExperience = "ExperienceA" | "ExperienceB";

export interface v156UserData {
  user: v156BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v156Business>;
  currentBusinessId: string;
}

export interface v156Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v156ProfileData;
  onboardingFormProgress: v156OnboardingFormProgress;
  taskProgress: Record<string, v156TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v156LicenseData | undefined;
  preferences: v156Preferences;
  taxFilingData: v156TaxFilingData;
  formationData: v156FormationData;
  environmentData: v156EnvironmentData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v156ProfileData extends v156IndustrySpecificData {
  businessPersona: v156BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v156Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v156ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v156ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v156OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v156CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
}

export type v156CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v156Municipality;
};

type v156BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v156ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v156ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
};

interface v156ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v156BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v156OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v156CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v156CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v156ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v156ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v156EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v156EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v156ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v156Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v156TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v156TaxFilingErrorFields = "businessName" | "formFailure";

type v156TaxFilingData = {
  state?: v156TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v156TaxFilingErrorFields;
  businessName?: string;
  filings: v156TaxFilingCalendarEvent[];
};

export type v156CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v156TaxFilingCalendarEvent extends v156CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v156LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v156LicenseSearchNameAndAddress extends v156LicenseSearchAddress {
  name: string;
}

type v156LicenseDetails = {
  nameAndAddress: v156LicenseSearchNameAndAddress;
  licenseStatus: v156LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v156LicenseStatusItem[];
};

const v156taskIdLicenseNameMapping = {
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

type v156LicenseTaskID = keyof typeof v156taskIdLicenseNameMapping;

export type v156LicenseName = (typeof v156taskIdLicenseNameMapping)[v156LicenseTaskID];

type v156Licenses = Partial<Record<v156LicenseName, v156LicenseDetails>>;

type v156LicenseData = {
  lastUpdatedISO: string;
  licenses?: v156Licenses;
};

type v156Preferences = {
  roadmapOpenSections: v156SectionType[];
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

type v156LicenseStatusItem = {
  title: string;
  status: v156CheckoffStatus;
};

type v156CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v156LicenseStatus =
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

const v156LicenseStatuses: v156LicenseStatus[] = [
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

const v156SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
type v156SectionType = (typeof v156SectionNames)[number];

type v156ExternalStatus = {
  newsletter?: v156NewsletterResponse;
  userTesting?: v156UserTestingResponse;
};

interface v156NewsletterResponse {
  success?: boolean;
  status: v156NewsletterStatus;
}

interface v156UserTestingResponse {
  success?: boolean;
  status: v156UserTestingStatus;
}

type v156NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v156UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v156NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v156NameAvailabilityResponse {
  status: v156NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v156NameAvailability extends v156NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v156FormationData {
  formationFormData: v156FormationFormData;
  businessNameAvailability: v156NameAvailability | undefined;
  dbaBusinessNameAvailability: v156NameAvailability | undefined;
  formationResponse: v156FormationSubmitResponse | undefined;
  getFilingResponse: v156GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v156InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v156FormationFormData extends v156FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v156BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v156InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v156InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v156InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v156InFormInBylaws;
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
  readonly members: v156FormationMember[] | undefined;
  readonly incorporators: v156FormationIncorporator[] | undefined;
  readonly signers: v156FormationSigner[] | undefined;
  readonly paymentType: v156PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v156StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v156ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v156ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v156StateObject = {
  shortCode: string;
  name: string;
};

interface v156FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v156StateObject;
  readonly addressMunicipality?: v156Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v156FormationBusinessLocationType | undefined;
}

type v156FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v156SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v156FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v156SignerTitle;
}

interface v156FormationIncorporator extends v156FormationSigner, v156FormationAddress {}

interface v156FormationMember extends v156FormationAddress {
  readonly name: string;
}

type v156PaymentType = "CC" | "ACH" | undefined;

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

type v156BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v156FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v156FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v156FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v156GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export type v156EnvironmentData = {
  waste?: v156WasteData;
  land?: v156LandData;
  air?: v156AirData;
};

export type v156MediaArea = keyof v156EnvironmentData;
export type v156QuestionnaireFieldIds =
  | v156WasteQuestionnaireFieldIds
  | v156LandQuestionnaireFieldIds
  | v156AirQuestionnaireFieldIds;
export type v156Questionnaire = Record<v156QuestionnaireFieldIds, boolean>;
export type v156QuestionnaireConfig = Record<v156QuestionnaireFieldIds, string>;

export type v156WasteData = {
  questionnaireData: v156WasteQuestionnaireData;
  submitted: boolean;
};

export type v156WasteQuestionnaireFieldIds =
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v156WasteQuestionnaireData = Record<v156WasteQuestionnaireFieldIds, boolean>;

export type v156LandData = {
  questionnaireData: v156LandQuestionnaireData;
  submitted: boolean;
};

export type v156LandQuestionnaireFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v156LandQuestionnaireData = Record<v156LandQuestionnaireFieldIds, boolean>;

export type v156AirData = {
  questionnaireData: v156AirQuestionnaireData;
  submitted: boolean;
};

export type v156AirQuestionnaireFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v156AirQuestionnaireData = Record<v156AirQuestionnaireFieldIds, boolean>;

// ---------------- v156 generators ----------------

export const generatev156UserData = (overrides: Partial<v156UserData>): v156UserData => {
  return {
    user: generatev156BusinessUser({}),
    version: 156,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev156Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev156BusinessUser = (
  overrides: Partial<v156BusinessUser>,
): v156BusinessUser => {
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

export const generatev156Business = (overrides: Partial<v156Business>): v156Business => {
  const profileData = generatev156ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    profileData: profileData,
    preferences: generatev156Preferences({}),
    formationData: generatev156FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    licenseData: undefined,
    taxFilingData: generatev156TaxFilingData({}),
    environmentData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 156,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev156ProfileData = (overrides: Partial<v156ProfileData>): v156ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev156IndustrySpecificData({}),
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

export const generatev156IndustrySpecificData = (
  overrides: Partial<v156IndustrySpecificData>,
): v156IndustrySpecificData => {
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

export const generatev156Preferences = (overrides: Partial<v156Preferences>): v156Preferences => {
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

export const generatev156FormationData = (
  overrides: Partial<v156FormationData>,
  legalStructureId: string,
): v156FormationData => {
  return {
    formationFormData: generatev156FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev156FormationFormData = (
  overrides: Partial<v156FormationFormData>,
  legalStructureId: string,
): v156FormationFormData => {
  const isCorp = legalStructureId
    ? ["s-corporation", "c-corporation"].includes(legalStructureId)
    : false;

  return <v156FormationFormData>{
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
    addressMunicipality: generatev156Municipality({}),
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
      legalStructureId === "limited-liability-partnership" ? [] : [generatev156FormationMember({})],
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

export const generatev156Municipality = (
  overrides: Partial<v156Municipality>,
): v156Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev156FormationMember = (
  overrides: Partial<v156FormationMember>,
): v156FormationMember => {
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

export const generatev156TaxFilingData = (
  overrides: Partial<v156TaxFilingData>,
): v156TaxFilingData => {
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

export const generatev156LicenseDetails = (
  overrides: Partial<v156LicenseDetails>,
): v156LicenseDetails => {
  return {
    nameAndAddress: generatev156LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv156LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev156LicenseStatusItem()],
    ...overrides,
  };
};

const generatev156LicenseSearchNameAndAddress = (
  overrides: Partial<v156LicenseSearchNameAndAddress>,
): v156LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev156LicenseStatusItem = (): v156LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv156LicenseStatus = (): v156LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v156LicenseStatuses.length);
  return v156LicenseStatuses[randomIndex];
};

import { type MigrationClients } from "@db/migrations/types";
import {
  v168Business,
  v168FormationData,
  v168FormationFormData,
  v168UserData,
} from "@db/migrations/v168_add_cigarette_license_data";
import { randomInt } from "@shared/intHelpers";

export const migrate_v168_to_v169 = (
  v168Data: v168UserData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _?: MigrationClients,
): v169UserData => {
  const updatedUserData = structuredClone(v168Data) as v169UserData;
  const updatedBusinesss = Object.fromEntries(
    Object.values(v168Data.businesses)
      .map((business: v168Business) => migrate_v168Business_to_v169Business(business))
      .map((currBusiness: v169Business) => [currBusiness.id, currBusiness]),
  );

  updatedUserData.businesses = updatedBusinesss;
  updatedUserData.version = 169;

  return updatedUserData;
};

/*
  While we never had a migration to add this, there is at least 1 business in production with
  this data and it needs to be removed from the Business object.
*/
interface TEMP_FormationFormData extends v168FormationFormData {
  contactEmail: string | undefined;
}

interface TEMP_FormationData extends v168FormationData {
  formationFormData: TEMP_FormationFormData;
}

interface TEMP_Business extends v168Business {
  formationData: TEMP_FormationData;
}

export const migrate_v168Business_to_v169Business = (business: v168Business): v169Business => {
  const businessWithContactEmail = structuredClone(business) as TEMP_Business;
  businessWithContactEmail.formationData.formationFormData.contactEmail = "";

  const businessWithoutContactEmail: v169Business = businessWithContactEmail;
  delete businessWithContactEmail.formationData.formationFormData.contactEmail;

  return businessWithoutContactEmail;
};

export interface v169IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v169CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v169CarServiceType | undefined;
  interstateTransport: boolean;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v169ConstructionType;
  residentialConstructionType: v169ResidentialConstructionType;
  employmentPersonnelServiceType: v169EmploymentAndPersonnelServicesType;
  employmentPlacementType: v169EmploymentPlacementType;
  carnivalRideOwningBusiness: boolean | undefined;
  propertyLeaseType: v169PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  travelingCircusOrCarnivalOwningBusiness: boolean | undefined;
  vacantPropertyOwner: boolean | undefined;
}

export type v169PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v169 types ----------------
type v169TaskProgress = "TO_DO" | "COMPLETED";
type v169OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v169ABExperience = "ExperienceA" | "ExperienceB";

export interface v169UserData {
  user: v169BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v169Business>;
  currentBusinessId: string;
}

export interface v169Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v169ProfileData;
  onboardingFormProgress: v169OnboardingFormProgress;
  taskProgress: Record<string, v169TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v169LicenseData | undefined;
  preferences: v169Preferences;
  taxFilingData: v169TaxFilingData;
  formationData: v169FormationData;
  environmentData: v169EnvironmentData | undefined;
  xrayRegistrationData: v169XrayData | undefined;
  roadmapTaskData: v169RoadmapTaskData;
  taxClearanceCertificateData: v169TaxClearanceCertificateData | undefined;
  cigaretteLicenseData: v169CigaretteLicenseData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v169RoadmapTaskData {
  manageBusinessVehicles?: boolean;
}

export interface v169ProfileData extends v169IndustrySpecificData {
  businessPersona: v169BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v169Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  hashedTaxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v169ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v169ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v169OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v169CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
}

export type v169CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v169Municipality;
};

type v169BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v169ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v169ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
};

interface v169ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v169BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v169OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v169CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v169CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v169ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v169ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v169EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v169EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v169ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v169Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v169TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v169TaxFilingErrorFields = "businessName" | "formFailure";

type v169TaxFilingData = {
  state?: v169TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v169TaxFilingErrorFields;
  businessName?: string;
  filings: v169TaxFilingCalendarEvent[];
};

export type v169CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v169TaxFilingCalendarEvent extends v169CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v169LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v169LicenseSearchNameAndAddress extends v169LicenseSearchAddress {
  name: string;
}

type v169LicenseDetails = {
  nameAndAddress: v169LicenseSearchNameAndAddress;
  licenseStatus: v169LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v169LicenseStatusItem[];
};

const v169taskIdLicenseNameMapping = {
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

type v169LicenseTaskID = keyof typeof v169taskIdLicenseNameMapping;

export type v169LicenseName = (typeof v169taskIdLicenseNameMapping)[v169LicenseTaskID];

type v169Licenses = Partial<Record<v169LicenseName, v169LicenseDetails>>;

type v169LicenseData = {
  lastUpdatedISO: string;
  licenses?: v169Licenses;
};

type v169Preferences = {
  roadmapOpenSections: v169SectionType[];
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

type v169LicenseStatusItem = {
  title: string;
  status: v169CheckoffStatus;
};

type v169CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v169LicenseStatus =
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

const v169LicenseStatuses: v169LicenseStatus[] = [
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

const v169SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
type v169SectionType = (typeof v169SectionNames)[number];

type v169ExternalStatus = {
  newsletter?: v169NewsletterResponse;
  userTesting?: v169UserTestingResponse;
};

interface v169NewsletterResponse {
  success?: boolean;
  status: v169NewsletterStatus;
}

interface v169UserTestingResponse {
  success?: boolean;
  status: v169UserTestingStatus;
}

type v169NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v169UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v169NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v169NameAvailabilityResponse {
  status: v169NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v169NameAvailability extends v169NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v169FormationData {
  formationFormData: v169FormationFormData;
  businessNameAvailability: v169NameAvailability | undefined;
  dbaBusinessNameAvailability: v169NameAvailability | undefined;
  formationResponse: v169FormationSubmitResponse | undefined;
  getFilingResponse: v169GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v169InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v169FormationFormData extends v169FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v169BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v169InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v169InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v169InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v169InFormInBylaws;
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
  readonly members: v169FormationMember[] | undefined;
  readonly incorporators: v169FormationIncorporator[] | undefined;
  readonly signers: v169FormationSigner[] | undefined;
  readonly paymentType: v169PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v169StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v169ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v169ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v169StateObject = {
  shortCode: string;
  name: string;
};

interface v169FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v169StateObject;
  readonly addressMunicipality?: v169Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v169FormationBusinessLocationType | undefined;
}

type v169FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v169SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v169FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v169SignerTitle;
}

interface v169FormationIncorporator extends v169FormationSigner, v169FormationAddress {}

interface v169FormationMember extends v169FormationAddress {
  readonly name: string;
}

type v169PaymentType = "CC" | "ACH" | undefined;

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

type v169BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v169FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v169FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v169FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v169GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export type v169EnvironmentData = {
  waste?: v169WasteData;
  land?: v169LandData;
  air?: v169AirData;
};

export type v169MediaArea = keyof v169EnvironmentData;
export type v169QuestionnaireFieldIds =
  | v169WasteQuestionnaireFieldIds
  | v169LandQuestionnaireFieldIds
  | v169AirQuestionnaireFieldIds;
export type v169Questionnaire = Record<v169QuestionnaireFieldIds, boolean>;
export type v169QuestionnaireConfig = Record<v169QuestionnaireFieldIds, string>;

export type v169WasteData = {
  questionnaireData: v169WasteQuestionnaireData;
  submitted: boolean;
};

export type v169WasteQuestionnaireFieldIds =
  | "transportWaste"
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v169WasteQuestionnaireData = Record<v169WasteQuestionnaireFieldIds, boolean>;

export type v169LandData = {
  questionnaireData: v169LandQuestionnaireData;
  submitted: boolean;
};

export type v169LandQuestionnaireFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v169LandQuestionnaireData = Record<v169LandQuestionnaireFieldIds, boolean>;

export type v169AirData = {
  questionnaireData: v169AirQuestionnaireData;
  submitted: boolean;
};

export type v169AirQuestionnaireFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v169AirQuestionnaireData = Record<v169AirQuestionnaireFieldIds, boolean>;

export type v169TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: v169StateObject | undefined;
  addressZipCode: string | undefined;
  taxId: string | undefined;
  taxPin: string | undefined;
  hasPreviouslyReceivedCertificate: boolean | undefined;
  lastUpdatedISO: string | undefined;
};

export type v169CigaretteLicenseAddress = {
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState?: v169StateObject;
  addressZipCode: string;
};

export type v169CigaretteLicenseData = {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId: string;
  encryptedTaxId: string;
  businessAddress: v169CigaretteLicenseAddress;
  mailingAddressIsTheSame: boolean;
  mailingAddress?: v169CigaretteLicenseAddress;
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
  salesInfoStartDate: string;
  salesInfoSupplier: string[];
  lastUpdatedISO?: string;
};

export type v169XrayData = {
  facilityDetails?: v169FacilityDetails;
  machines?: v169MachineDetails[];
  status?: v169XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
  lastUpdatedISO?: string;
};

export type v169FacilityDetails = {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  addressZipCode: string;
};

export type v169MachineDetails = {
  name?: string;
  registrationNumber?: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type v169XrayRegistrationStatusResponse = {
  machines: v169MachineDetails[];
  status: v169XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type v169XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

// ---------------- v169 generators ----------------

export const generatev169UserData = (overrides: Partial<v169UserData>): v169UserData => {
  return {
    user: generatev169BusinessUser({}),
    version: 169,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev169Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev169BusinessUser = (
  overrides: Partial<v169BusinessUser>,
): v169BusinessUser => {
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

export const generatev169RoadmapTaskData = (
  overrides: Partial<v169RoadmapTaskData>,
): v169RoadmapTaskData => {
  return {
    manageBusinessVehicles: undefined,
    ...overrides,
  };
};

export const generatev169Business = (overrides: Partial<v169Business>): v169Business => {
  const profileData = generatev169ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    profileData: profileData,
    preferences: generatev169Preferences({}),
    formationData: generatev169FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taxClearanceCertificateData: generatev169TaxClearanceCertificateData({}),
    cigaretteLicenseData: generatev169CigaretteLicenseData({}),
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    roadmapTaskData: generatev169RoadmapTaskData({}),
    licenseData: undefined,
    taxFilingData: generatev169TaxFilingData({}),
    environmentData: undefined,
    xrayRegistrationData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 169,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev169ProfileData = (overrides: Partial<v169ProfileData>): v169ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev169IndustrySpecificData({}),
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
    ...overrides,
  };
};

export const generatev169IndustrySpecificData = (
  overrides: Partial<v169IndustrySpecificData>,
): v169IndustrySpecificData => {
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

export const generatev169Preferences = (overrides: Partial<v169Preferences>): v169Preferences => {
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

export const generatev169FormationData = (
  overrides: Partial<v169FormationData>,
  legalStructureId: string,
): v169FormationData => {
  return {
    formationFormData: generatev169FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev169FormationFormData = (
  overrides: Partial<v169FormationFormData>,
  legalStructureId: string,
): v169FormationFormData => {
  const isCorp = legalStructureId
    ? ["s-corporation", "c-corporation"].includes(legalStructureId)
    : false;

  return <v169FormationFormData>{
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
    addressMunicipality: generatev169Municipality({}),
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
      legalStructureId === "limited-liability-partnership" ? [] : [generatev169FormationMember({})],
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

export const generatev169Municipality = (
  overrides: Partial<v169Municipality>,
): v169Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev169FormationMember = (
  overrides: Partial<v169FormationMember>,
): v169FormationMember => {
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

export const generatev169TaxFilingData = (
  overrides: Partial<v169TaxFilingData>,
): v169TaxFilingData => {
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

export const generatev169LicenseDetails = (
  overrides: Partial<v169LicenseDetails>,
): v169LicenseDetails => {
  return {
    nameAndAddress: generatev169LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv169LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev169LicenseStatusItem()],
    ...overrides,
  };
};

const generatev169LicenseSearchNameAndAddress = (
  overrides: Partial<v169LicenseSearchNameAndAddress>,
): v169LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev169LicenseStatusItem = (): v169LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv169LicenseStatus = (): v169LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v169LicenseStatuses.length);
  return v169LicenseStatuses[randomIndex];
};

export const generatev169TaxClearanceCertificateData = (
  overrides: Partial<v169TaxClearanceCertificateData>,
): v169TaxClearanceCertificateData => {
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

export const generatev169CigaretteLicenseAddress = (
  overrides: Partial<v169CigaretteLicenseAddress>,
): v169CigaretteLicenseAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressCity: `some-city-${randomInt()}`,
    addressState: undefined,
    addressZipCode: randomInt(5).toString(),
    ...overrides,
  };
};

export const generatev169CigaretteLicenseData = (
  overrides: Partial<v169CigaretteLicenseData>,
): v169CigaretteLicenseData => {
  const taxId = randomInt(12).toString();
  const maskingCharacter = "*";
  return {
    businessName: `some-business-name-${randomInt()}`,
    responsibleOwnerName: `some-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    taxId: maskingCharacter.repeat(7) + taxId.slice(-5),
    encryptedTaxId: `encrypted-${taxId}`,
    businessAddress: generatev169CigaretteLicenseAddress({}),
    mailingAddressIsTheSame: false,
    mailingAddress: generatev169CigaretteLicenseAddress({}),
    contactName: `some-contact-name-${randomInt()}`,
    contactPhoneNumber: `some-phone-number-${randomInt()}`,
    contactEmail: `some-email-${randomInt()}`,
    salesInfoStartDate: "08/31/2025",
    salesInfoSupplier: [],
    lastUpdatedISO: "",
    ...overrides,
  };
};

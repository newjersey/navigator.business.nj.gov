import { type MigrationClients } from "@db/migrations/types";
import {
  v165Business,
  v165UserData,
} from "@db/migrations/v165_add_last_updated_iso_to_xray_registration_data";
import { randomInt } from "@shared/intHelpers";
import { cloneDeep } from "lodash";

export const migrate_v165_to_v166 = async (
  v165Data: v165UserData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _?: MigrationClients,
): Promise<v166UserData> => {
  const businesses = Object.values(v165Data.businesses);
  const newBusinesses = [];
  for (const business of businesses) {
    newBusinesses.push(await migrate_v165Business_to_v166Business(business));
  }
  return {
    ...v165Data,
    businesses: Object.fromEntries(
      newBusinesses.map((currBusiness: v166Business) => [currBusiness.id, currBusiness]),
    ),
    version: 166,
  } as v166UserData;
};

export const migrate_v165Business_to_v166Business = async (
  business: v165Business,
): Promise<v166Business> => {
  const v165BuinessCopy = cloneDeep(business);
  const newBusiness = { ...v165BuinessCopy, version: 166, roadmapTaskData: {} } as v166Business;

  const nonEssentialRadioAnswers =
    newBusiness.profileData.nonEssentialRadioAnswers["business-vehicle-title-reg"];
  delete newBusiness.profileData.nonEssentialRadioAnswers["business-vehicle-title-reg"];

  if (nonEssentialRadioAnswers === true) {
    newBusiness.roadmapTaskData.manageBusinessVehicles = true;
    newBusiness.taskProgress["manage-business-vehicles"] = "COMPLETED";
  }

  if (nonEssentialRadioAnswers === false) {
    newBusiness.roadmapTaskData.manageBusinessVehicles = false;
    newBusiness.taskProgress["manage-business-vehicles"] = "TO_DO";
  }

  if (nonEssentialRadioAnswers === undefined) {
    newBusiness.roadmapTaskData.manageBusinessVehicles = undefined;
  }

  return newBusiness;
};

export interface v166IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v166CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v166CarServiceType | undefined;
  interstateTransport: boolean;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v166ConstructionType;
  residentialConstructionType: v166ResidentialConstructionType;
  employmentPersonnelServiceType: v166EmploymentAndPersonnelServicesType;
  employmentPlacementType: v166EmploymentPlacementType;
  carnivalRideOwningBusiness: boolean | undefined;
  propertyLeaseType: v166PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  travelingCircusOrCarnivalOwningBusiness: boolean | undefined;
  vacantPropertyOwner: boolean | undefined;
}

export type v166PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v166 types ----------------
type v166TaskProgress = "TO_DO" | "COMPLETED";
type v166OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v166ABExperience = "ExperienceA" | "ExperienceB";

export interface v166UserData {
  user: v166BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v166Business>;
  currentBusinessId: string;
}

export interface v166Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v166ProfileData;
  onboardingFormProgress: v166OnboardingFormProgress;
  taskProgress: Record<string, v166TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v166LicenseData | undefined;
  preferences: v166Preferences;
  taxFilingData: v166TaxFilingData;
  formationData: v166FormationData;
  environmentData: v166EnvironmentData | undefined;
  xrayRegistrationData: v166XrayData | undefined;
  roadmapTaskData: v166RoadmapTaskData;
  taxClearanceCertificateData: v166TaxClearanceCertificateData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v166RoadmapTaskData {
  manageBusinessVehicles?: boolean;
}

export interface v166ProfileData extends v166IndustrySpecificData {
  businessPersona: v166BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v166Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  hashedTaxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v166ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v166ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v166OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v166CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
}

export type v166CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v166Municipality;
};

type v166BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v166ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v166ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
};

interface v166ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v166BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v166OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v166CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v166CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v166ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v166ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v166EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v166EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v166ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v166Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v166TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v166TaxFilingErrorFields = "businessName" | "formFailure";

type v166TaxFilingData = {
  state?: v166TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v166TaxFilingErrorFields;
  businessName?: string;
  filings: v166TaxFilingCalendarEvent[];
};

export type v166CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v166TaxFilingCalendarEvent extends v166CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v166LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v166LicenseSearchNameAndAddress extends v166LicenseSearchAddress {
  name: string;
}

type v166LicenseDetails = {
  nameAndAddress: v166LicenseSearchNameAndAddress;
  licenseStatus: v166LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v166LicenseStatusItem[];
};

const v166taskIdLicenseNameMapping = {
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

type v166LicenseTaskID = keyof typeof v166taskIdLicenseNameMapping;

export type v166LicenseName = (typeof v166taskIdLicenseNameMapping)[v166LicenseTaskID];

type v166Licenses = Partial<Record<v166LicenseName, v166LicenseDetails>>;

type v166LicenseData = {
  lastUpdatedISO: string;
  licenses?: v166Licenses;
};

type v166Preferences = {
  roadmapOpenSections: v166SectionType[];
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

type v166LicenseStatusItem = {
  title: string;
  status: v166CheckoffStatus;
};

type v166CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v166LicenseStatus =
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

const v166LicenseStatuses: v166LicenseStatus[] = [
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

const v166SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
type v166SectionType = (typeof v166SectionNames)[number];

type v166ExternalStatus = {
  newsletter?: v166NewsletterResponse;
  userTesting?: v166UserTestingResponse;
};

interface v166NewsletterResponse {
  success?: boolean;
  status: v166NewsletterStatus;
}

interface v166UserTestingResponse {
  success?: boolean;
  status: v166UserTestingStatus;
}

type v166NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v166UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v166NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v166NameAvailabilityResponse {
  status: v166NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v166NameAvailability extends v166NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v166FormationData {
  formationFormData: v166FormationFormData;
  businessNameAvailability: v166NameAvailability | undefined;
  dbaBusinessNameAvailability: v166NameAvailability | undefined;
  formationResponse: v166FormationSubmitResponse | undefined;
  getFilingResponse: v166GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v166InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v166FormationFormData extends v166FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v166BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v166InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v166InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v166InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v166InFormInBylaws;
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
  readonly members: v166FormationMember[] | undefined;
  readonly incorporators: v166FormationIncorporator[] | undefined;
  readonly signers: v166FormationSigner[] | undefined;
  readonly paymentType: v166PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v166StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v166ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v166ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v166StateObject = {
  shortCode: string;
  name: string;
};

interface v166FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v166StateObject;
  readonly addressMunicipality?: v166Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v166FormationBusinessLocationType | undefined;
}

type v166FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v166SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v166FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v166SignerTitle;
}

interface v166FormationIncorporator extends v166FormationSigner, v166FormationAddress {}

interface v166FormationMember extends v166FormationAddress {
  readonly name: string;
}

type v166PaymentType = "CC" | "ACH" | undefined;

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

type v166BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v166FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v166FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v166FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v166GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export type v166EnvironmentData = {
  waste?: v166WasteData;
  land?: v166LandData;
  air?: v166AirData;
};

export type v166MediaArea = keyof v166EnvironmentData;
export type v166QuestionnaireFieldIds =
  | v166WasteQuestionnaireFieldIds
  | v166LandQuestionnaireFieldIds
  | v166AirQuestionnaireFieldIds;
export type v166Questionnaire = Record<v166QuestionnaireFieldIds, boolean>;
export type v166QuestionnaireConfig = Record<v166QuestionnaireFieldIds, string>;

export type v166WasteData = {
  questionnaireData: v166WasteQuestionnaireData;
  submitted: boolean;
};

export type v166WasteQuestionnaireFieldIds =
  | "transportWaste"
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v166WasteQuestionnaireData = Record<v166WasteQuestionnaireFieldIds, boolean>;

export type v166LandData = {
  questionnaireData: v166LandQuestionnaireData;
  submitted: boolean;
};

export type v166LandQuestionnaireFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v166LandQuestionnaireData = Record<v166LandQuestionnaireFieldIds, boolean>;

export type v166AirData = {
  questionnaireData: v166AirQuestionnaireData;
  submitted: boolean;
};

export type v166AirQuestionnaireFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v166AirQuestionnaireData = Record<v166AirQuestionnaireFieldIds, boolean>;

export type v166TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: v166StateObject | undefined;
  addressZipCode: string | undefined;
  taxId: string | undefined;
  taxPin: string | undefined;
  hasPreviouslyReceivedCertificate: boolean | undefined;
  lastUpdatedISO: string | undefined;
};

export type v166XrayData = {
  facilityDetails?: v166FacilityDetails;
  machines?: v166MachineDetails[];
  status?: v166XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
  lastUpdatedISO?: string;
};

export type v166FacilityDetails = {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  addressZipCode: string;
};

export type v166MachineDetails = {
  name?: string;
  registrationNumber?: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type v166XrayRegistrationStatusResponse = {
  machines: v166MachineDetails[];
  status: v166XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type v166XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

// ---------------- v166 generators ----------------

export const generatev166UserData = (overrides: Partial<v166UserData>): v166UserData => {
  return {
    user: generatev166BusinessUser({}),
    version: 166,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev166Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev166BusinessUser = (
  overrides: Partial<v166BusinessUser>,
): v166BusinessUser => {
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

export const generatev166RoadmapTaskData = (
  overrides: Partial<v166RoadmapTaskData>,
): v166RoadmapTaskData => {
  return {
    manageBusinessVehicles: undefined,
    ...overrides,
  };
};

export const generatev166Business = (overrides: Partial<v166Business>): v166Business => {
  const profileData = generatev166ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    profileData: profileData,
    preferences: generatev166Preferences({}),
    formationData: generatev166FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taxClearanceCertificateData: generatev166TaxClearanceCertificateData({}),
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    roadmapTaskData: generatev166RoadmapTaskData({}),
    licenseData: undefined,
    taxFilingData: generatev166TaxFilingData({}),
    environmentData: undefined,
    xrayRegistrationData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 166,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev166ProfileData = (overrides: Partial<v166ProfileData>): v166ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev166IndustrySpecificData({}),
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

export const generatev166IndustrySpecificData = (
  overrides: Partial<v166IndustrySpecificData>,
): v166IndustrySpecificData => {
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

export const generatev166Preferences = (overrides: Partial<v166Preferences>): v166Preferences => {
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

export const generatev166FormationData = (
  overrides: Partial<v166FormationData>,
  legalStructureId: string,
): v166FormationData => {
  return {
    formationFormData: generatev166FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev166FormationFormData = (
  overrides: Partial<v166FormationFormData>,
  legalStructureId: string,
): v166FormationFormData => {
  const isCorp = legalStructureId
    ? ["s-corporation", "c-corporation"].includes(legalStructureId)
    : false;

  return <v166FormationFormData>{
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
    addressMunicipality: generatev166Municipality({}),
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
      legalStructureId === "limited-liability-partnership" ? [] : [generatev166FormationMember({})],
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

export const generatev166Municipality = (
  overrides: Partial<v166Municipality>,
): v166Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev166FormationMember = (
  overrides: Partial<v166FormationMember>,
): v166FormationMember => {
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

export const generatev166TaxFilingData = (
  overrides: Partial<v166TaxFilingData>,
): v166TaxFilingData => {
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

export const generatev166LicenseDetails = (
  overrides: Partial<v166LicenseDetails>,
): v166LicenseDetails => {
  return {
    nameAndAddress: generatev166LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv166LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev166LicenseStatusItem()],
    ...overrides,
  };
};

const generatev166LicenseSearchNameAndAddress = (
  overrides: Partial<v166LicenseSearchNameAndAddress>,
): v166LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev166LicenseStatusItem = (): v166LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv166LicenseStatus = (): v166LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v166LicenseStatuses.length);
  return v166LicenseStatuses[randomIndex];
};

export const generatev166TaxClearanceCertificateData = (
  overrides: Partial<v166TaxClearanceCertificateData>,
): v166TaxClearanceCertificateData => {
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

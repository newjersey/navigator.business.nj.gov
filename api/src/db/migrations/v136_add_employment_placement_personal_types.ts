import {
  v135Business,
  v135UserData,
} from "@db/migrations/v135_use_interstate_logistics_and_transport_fields";
import { randomInt } from "@shared/intHelpers";

export interface v136IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v136CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v136CarServiceType | undefined;
  interstateTransport: boolean;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v136ConstructionType;
  residentialConstructionType: v136ResidentialConstructionType;
  employmentPersonnelServiceType: v136EmploymentAndPersonnelServicesType;
  employmentPlacementType: v136EmploymentPlacementType;
}

export const migrate_v135_to_v136 = (v135Data: v135UserData): v136UserData => {
  return {
    ...v135Data,
    businesses: Object.fromEntries(
      Object.values(v135Data.businesses)
        .map((business: v135Business) => migrate_v135Business_to_v136Business(business))
        .map((currBusiness: v136Business) => [currBusiness.id, currBusiness])
    ),
    version: 136,
  } as v136UserData;
};

const migrate_v135Business_to_v136Business = (business: v135Business): v136Business => {
  return {
    ...business,
    profileData: {
      ...business.profileData,
      employmentPersonnelServiceType: undefined,
      employmentPlacementType: undefined,
    },
  } as v136Business;
};

// ---------------- v136 types ----------------
type v136TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v136OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v136ABExperience = "ExperienceA" | "ExperienceB";

export interface v136UserData {
  user: v136BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v136Business>;
  currentBusinessId: string;
}

export interface v136Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v136ProfileData;
  onboardingFormProgress: v136OnboardingFormProgress;
  taskProgress: Record<string, v136TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v136LicenseData | undefined;
  preferences: v136Preferences;
  taxFilingData: v136TaxFilingData;
  formationData: v136FormationData;
}

export interface v136ProfileData extends v136IndustrySpecificData {
  businessPersona: v136BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v136Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v136ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v136ForeignBusinessTypeId[];
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v136OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v136CommunityAffairsAddress;
}

export type v136CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v136Municipality;
};

type v136BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v136ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v136ABExperience;
};

interface v136ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v136BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v136OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v136CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v136CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v136ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v136ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v136EmploymentAndPersonnelServicesType = "JOB SEEKERS" | "EMPLOYERS" | undefined;
export type v136EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v136ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v136Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v136TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v136TaxFilingErrorFields = "businessName" | "formFailure";

type v136TaxFilingData = {
  state?: v136TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v136TaxFilingErrorFields;
  businessName?: string;
  filings: v136TaxFilingCalendarEvent[];
};

export type v136CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v136TaxFilingCalendarEvent extends v136CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v136NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v136LicenseData = {
  nameAndAddress: v136NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v136LicenseStatus;
  items: v136LicenseStatusItem[];
};

type v136Preferences = {
  roadmapOpenSections: v136SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v136LicenseStatusItem = {
  title: string;
  status: v136CheckoffStatus;
};

type v136CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v136LicenseStatus =
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

const v136SectionNames = ["PLAN", "START"] as const;
type v136SectionType = (typeof v136SectionNames)[number];

type v136ExternalStatus = {
  newsletter?: v136NewsletterResponse;
  userTesting?: v136UserTestingResponse;
};

interface v136NewsletterResponse {
  success?: boolean;
  status: v136NewsletterStatus;
}

interface v136UserTestingResponse {
  success?: boolean;
  status: v136UserTestingStatus;
}

type v136NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v136UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v136NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v136NameAvailabilityResponse {
  status: v136NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v136NameAvailability extends v136NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v136FormationData {
  formationFormData: v136FormationFormData;
  businessNameAvailability: v136NameAvailability | undefined;
  dbaBusinessNameAvailability: v136NameAvailability | undefined;
  formationResponse: v136FormationSubmitResponse | undefined;
  getFilingResponse: v136GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v136InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v136FormationFormData extends v136FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v136BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v136InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v136InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v136InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v136InFormInBylaws;
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
  readonly members: v136FormationMember[] | undefined;
  readonly incorporators: v136FormationIncorporator[] | undefined;
  readonly signers: v136FormationSigner[] | undefined;
  readonly paymentType: v136PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v136StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v136ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v136ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v136StateObject = {
  shortCode: string;
  name: string;
};

interface v136FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v136StateObject;
  readonly addressMunicipality?: v136Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v136FormationBusinessLocationType | undefined;
}

type v136FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v136SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v136FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v136SignerTitle;
}

interface v136FormationIncorporator extends v136FormationSigner, v136FormationAddress {}

interface v136FormationMember extends v136FormationAddress {
  readonly name: string;
}

type v136PaymentType = "CC" | "ACH" | undefined;

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

type v136BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v136FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v136FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v136FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v136GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v136 generators ----------------

export const generatev136UserData = (overrides: Partial<v136UserData>): v136UserData => {
  return {
    user: generatev136BusinessUser({}),
    version: 135,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: -1,
    businesses: {},
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev136BusinessUser = (overrides: Partial<v136BusinessUser>): v136BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    receiveNewsletter: false,
    userTesting: false,
    externalStatus: {},
    myNJUserKey: undefined,
    intercomHash: undefined,
    abExperience: "ExperienceA",
    ...overrides,
  };
};

export const generatev136Business = (overrides: Partial<v136Business>): v136Business => {
  const profileData = generatev136ProfileData({});
  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    profileData: profileData,
    preferences: generatev136Preferences({}),
    formationData: generatev136FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    taxFilingData: generatev136TaxFilingData({}),
    ...overrides,
  };
};

export const generatev136ProfileData = (overrides: Partial<v136ProfileData>): v136ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev136IndustrySpecificData({}),
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
    isNonprofitOnboardingRadio: false,
    nexusDbaName: "undefined",
    needsNexusDbaName: true,
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
    municipality: {
      name: `some-name-${randomInt()}`,
      displayName: `some-display-name-${randomInt()}`,
      county: `some-county-${randomInt()}`,
      id: `some-id-${randomInt()}`,
    },
    responsibleOwnerName: `some-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    elevatorOwningBusiness: undefined,
    nonEssentialRadioAnswers: {},
    ...overrides,
  };
};

export const generatev136IndustrySpecificData = (
  overrides: Partial<v136IndustrySpecificData>
): v136IndustrySpecificData => {
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
    ...overrides,
  };
};

export const generatev136Preferences = (overrides: Partial<v136Preferences>): v136Preferences => {
  return {
    roadmapOpenSections: ["PLAN", "START"],
    roadmapOpenSteps: [],
    hiddenCertificationIds: [],
    hiddenFundingIds: [],
    visibleSidebarCards: ["other-card"],
    returnToLink: "",
    isCalendarFullView: true,
    isHideableRoadmapOpen: false,
    phaseNewlyChanged: false,
    ...overrides,
  };
};

export const generatev136FormationData = (
  overrides: Partial<v136FormationData>,
  legalStructureId: string
): v136FormationData => {
  return {
    formationFormData: generatev136FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev136FormationFormData = (
  overrides: Partial<v136FormationFormData>,
  legalStructureId: string
): v136FormationFormData => {
  const isCorp = legalStructureId ? ["s-corporation", "c-corporation"].includes(legalStructureId) : false;

  return <v136FormationFormData>{
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
    addressMunicipality: generatev136Municipality({}),
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
    provisions: [`some-provision-${randomInt()}`],
    agentNumberOrManual: randomInt() % 2 ? "NUMBER" : "MANUAL_ENTRY",
    agentNumber: `some-agent-number-${randomInt()}`,
    agentName: `some-agent-name-${randomInt()}`,
    agentEmail: `some-agent-email-${randomInt()}`,
    agentOfficeAddressLine1: `some-agent-office-address-1-${randomInt()}`,
    agentOfficeAddressLine2: `some-agent-office-address-2-${randomInt()}`,
    agentOfficeAddressCity: `some-agent-office-address-city-${randomInt()}`,
    agentOfficeAddressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    agentOfficeAddressMunicipality: generatev136Municipality({}),
    agentUseAccountInfo: !!(randomInt() % 2),
    agentUseBusinessAddress: !!(randomInt() % 2),
    signers: [{ name: "some-name", signature: true, title: "Authorized Representative" }],
    members: legalStructureId === "limited-liability-partnership" ? [] : [generatev136FormationMember({})],
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
    ...overrides,
  };
};

export const generatev136Municipality = (overrides: Partial<v136Municipality>): v136Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev136FormationMember = (overrides: Partial<v136FormationMember>): v136FormationMember => {
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

export const generatev136TaxFilingData = (overrides: Partial<v136TaxFilingData>): v136TaxFilingData => {
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

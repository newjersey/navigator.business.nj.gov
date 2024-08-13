import { v136Business, v136UserData } from "@db/migrations/v136_add_user_account_creation_source";
import { randomInt } from "@shared/intHelpers";

export const migrate_v136_to_v137 = (v136Data: v136UserData): v137UserData => {
  return {
    ...v136Data,
    businesses: Object.fromEntries(
      Object.values(v136Data.businesses)
        .map((business: v136Business) => migrate_v136Business_to_v137Business(business))
        .map((currBusiness: v137Business) => [currBusiness.id, currBusiness])
    ),
    version: 137,
  } as v137UserData;
};

const migrate_v136Business_to_v137Business = (business: v136Business): v137Business => {
  return {
    ...business,
    profileData: {
      ...business.profileData,
      employmentPersonnelServiceType: undefined,
      employmentPlacementType: undefined,
    },
  } as v137Business;
};

// ---------------- v137 types ----------------
export type v137TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v137OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v137ABExperience = "ExperienceA" | "ExperienceB";

export interface v137UserData {
  user: v137BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v137Business>;
  currentBusinessId: string;
}

export interface v137Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v137ProfileData;
  onboardingFormProgress: v137OnboardingFormProgress;
  taskProgress: Record<string, v137TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v137LicenseData | undefined;
  preferences: v137Preferences;
  taxFilingData: v137TaxFilingData;
  formationData: v137FormationData;
}

export interface v137IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v137CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v137CarServiceType | undefined;
  interstateTransport: boolean;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v137ConstructionType;
  residentialConstructionType: v137ResidentialConstructionType;
  employmentPersonnelServiceType: v137EmploymentAndPersonnelServicesType;
  employmentPlacementType: v137EmploymentPlacementType;
}

export interface v137ProfileData extends v137IndustrySpecificData {
  businessPersona: v137BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v137Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v137ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v137ForeignBusinessTypeId[];
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v137OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v137CommunityAffairsAddress;
}

export type v137CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v137Municipality;
};

type v137BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v137ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v137ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
};

interface v137ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v137BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v137OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v137CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v137CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v137ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v137ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v137EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v137EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v137ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v137Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v137TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v137TaxFilingErrorFields = "businessName" | "formFailure";

type v137TaxFilingData = {
  state?: v137TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v137TaxFilingErrorFields;
  businessName?: string;
  filings: v137TaxFilingCalendarEvent[];
};

export type v137CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v137TaxFilingCalendarEvent extends v137CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v137NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export type v137LicenseData = {
  nameAndAddress: v137NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v137LicenseStatus;
  items: v137LicenseStatusItem[];
  expirationISO: string;
};

type v137Preferences = {
  roadmapOpenSections: v137SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v137LicenseStatusItem = {
  title: string;
  status: v137CheckoffStatus;
};

type v137CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

interface v137LicenseSearchNameAndAddress extends v137LicenseSearchAddress {
  name: string;
}

type v137LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v137LicenseStatus =
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

const v137SectionNames = ["PLAN", "START"] as const;
type v137SectionType = (typeof v137SectionNames)[number];

type v137ExternalStatus = {
  newsletter?: v137NewsletterResponse;
  userTesting?: v137UserTestingResponse;
};

interface v137NewsletterResponse {
  success?: boolean;
  status: v137NewsletterStatus;
}

interface v137UserTestingResponse {
  success?: boolean;
  status: v137UserTestingStatus;
}

type v137NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v137UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v137NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v137NameAvailabilityResponse {
  status: v137NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v137NameAvailability extends v137NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v137FormationData {
  formationFormData: v137FormationFormData;
  businessNameAvailability: v137NameAvailability | undefined;
  dbaBusinessNameAvailability: v137NameAvailability | undefined;
  formationResponse: v137FormationSubmitResponse | undefined;
  getFilingResponse: v137GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v137InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v137FormationFormData extends v137FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v137BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v137InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v137InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v137InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v137InFormInBylaws;
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
  readonly members: v137FormationMember[] | undefined;
  readonly incorporators: v137FormationIncorporator[] | undefined;
  readonly signers: v137FormationSigner[] | undefined;
  readonly paymentType: v137PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v137StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v137ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v137ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v137StateObject = {
  shortCode: string;
  name: string;
};

interface v137FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v137StateObject;
  readonly addressMunicipality?: v137Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v137FormationBusinessLocationType | undefined;
}

type v137FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v137SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v137FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v137SignerTitle;
}

interface v137FormationIncorporator extends v137FormationSigner, v137FormationAddress {}

interface v137FormationMember extends v137FormationAddress {
  readonly name: string;
}

type v137PaymentType = "CC" | "ACH" | undefined;

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

type v137BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v137FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v137FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v137FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v137GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v137 generators ----------------

export const generatev137UserData = (overrides: Partial<v137UserData>): v137UserData => {
  return {
    user: generatev137BusinessUser({}),
    version: 134,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: -1,
    businesses: {},
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev137BusinessUser = (overrides: Partial<v137BusinessUser>): v137BusinessUser => {
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
    accountCreationSource: `some-source-${randomInt()}`,
    contactSharingWithAccountCreationPartner: false,
    ...overrides,
  };
};

export const generatev137Business = (overrides: Partial<v137Business>): v137Business => {
  const profileData = generatev137ProfileData({});
  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    profileData: profileData,
    preferences: generatev137Preferences({}),
    formationData: generatev137FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    taxFilingData: generatev137TaxFilingData({}),
    ...overrides,
  };
};

export const generatev137ProfileData = (overrides: Partial<v137ProfileData>): v137ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev137IndustrySpecificData({}),
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

export const generatev137IndustrySpecificData = (
  overrides: Partial<v137IndustrySpecificData>
): v137IndustrySpecificData => {
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

export const generatev137Preferences = (overrides: Partial<v137Preferences>): v137Preferences => {
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

export const generatev137FormationData = (
  overrides: Partial<v137FormationData>,
  legalStructureId: string
): v137FormationData => {
  return {
    formationFormData: generatev137FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev137FormationFormData = (
  overrides: Partial<v137FormationFormData>,
  legalStructureId: string
): v137FormationFormData => {
  const isCorp = legalStructureId ? ["s-corporation", "c-corporation"].includes(legalStructureId) : false;

  return <v137FormationFormData>{
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
    addressMunicipality: generatev137Municipality({}),
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
    agentOfficeAddressMunicipality: generatev137Municipality({}),
    agentUseAccountInfo: !!(randomInt() % 2),
    agentUseBusinessAddress: !!(randomInt() % 2),
    signers: [{ name: "some-name", signature: true, title: "Authorized Representative" }],
    members: legalStructureId === "limited-liability-partnership" ? [] : [generatev137FormationMember({})],
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

export const generatev137Municipality = (overrides: Partial<v137Municipality>): v137Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev137FormationMember = (overrides: Partial<v137FormationMember>): v137FormationMember => {
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

export const generatev137TaxFilingData = (overrides: Partial<v137TaxFilingData>): v137TaxFilingData => {
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

export const generatev137LicenseSearchNameAndAddress = (
  overrides: Partial<v137LicenseSearchNameAndAddress>
): v137LicenseSearchNameAndAddress => {
  return {
    name: `some-name-${randomInt()}`,
    ...generatev137LicenseSearchAddress({}),
    ...overrides,
  };
};

export const generatev137LicenseSearchAddress = (
  overrides: Partial<v137LicenseSearchAddress>
): v137LicenseSearchAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    zipCode: `some-zipcode-${randomInt()}`,
    ...overrides,
  };
};

export const generatev137LicenseStatusItem = (
  overrides: Partial<v137LicenseStatusItem>
): v137LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
    ...overrides,
  };
};

export const generatev137LicenseData = (overrides: Partial<v137LicenseData>): v137LicenseData => {
  return {
    nameAndAddress: generatev137LicenseSearchNameAndAddress({}),
    completedSearch: false,
    items: [generatev137LicenseStatusItem({})],
    status: "PENDING",
    lastUpdatedISO: "some-last-updated-date",
    expirationISO: "some-expiration-date",
    ...overrides,
  };
};

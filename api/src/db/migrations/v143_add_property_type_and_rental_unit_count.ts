import { v142Business, v142UserData } from "@db/migrations/v142_add_domestic_employer_roadmap_section";
import { randomInt } from "@shared/intHelpers";

export const migrate_v142_to_v143 = (v142Data: v142UserData): v143UserData => {
  return {
    ...v142Data,
    businesses: Object.fromEntries(
      Object.values(v142Data.businesses)
        .map((business: v142Business) => migrate_v142Business_to_v143Business(business))
        .map((currBusiness: v143Business) => [currBusiness.id, currBusiness])
    ),
    version: 143,
  } as v143UserData;
};

export const migrate_v142Business_to_v143Business = (business: v142Business): v143Business => {
  return {
    ...business,
    profileData: {
      ...business.profileData,
      propertyLeaseType: undefined,
      hasThreeOrMoreRentalUnits: undefined,
    },
  } as v143Business;
};

export interface v143IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v143CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v143CarServiceType | undefined;
  interstateTransport: boolean;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v143ConstructionType;
  residentialConstructionType: v143ResidentialConstructionType;
  employmentPersonnelServiceType: v143EmploymentAndPersonnelServicesType;
  employmentPlacementType: v143EmploymentPlacementType;
  carnivalRideOwningBusiness: boolean | undefined;
  propertyLeaseType: v143PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
}

export type v143PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v143 types ----------------
type v143TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v143OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v143ABExperience = "ExperienceA" | "ExperienceB";

export interface v143UserData {
  user: v143BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v143Business>;
  currentBusinessId: string;
}

export interface v143Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v143ProfileData;
  onboardingFormProgress: v143OnboardingFormProgress;
  taskProgress: Record<string, v143TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v143LicenseData | undefined;
  preferences: v143Preferences;
  taxFilingData: v143TaxFilingData;
  formationData: v143FormationData;
}

export interface v143ProfileData extends v143IndustrySpecificData {
  businessPersona: v143BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v143Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v143ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v143ForeignBusinessTypeId[];
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v143OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v143CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
}

export type v143CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v143Municipality;
};

type v143BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v143ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v143ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
};

interface v143ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v143BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v143OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v143CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v143CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v143ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v143ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v143EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v143EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v143ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v143Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v143TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v143TaxFilingErrorFields = "businessName" | "formFailure";

type v143TaxFilingData = {
  state?: v143TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v143TaxFilingErrorFields;
  businessName?: string;
  filings: v143TaxFilingCalendarEvent[];
};

export type v143CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v143TaxFilingCalendarEvent extends v143CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v143LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v143LicenseSearchNameAndAddress extends v143LicenseSearchAddress {
  name: string;
}

type v143LicenseDetails = {
  nameAndAddress: v143LicenseSearchNameAndAddress;
  licenseStatus: v143LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v143LicenseStatusItem[];
  hasError?: boolean;
};

const v143taskIdLicenseNameMapping = {
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

type v143LicenseTaskID = keyof typeof v143taskIdLicenseNameMapping;

export type v143LicenseName = (typeof v143taskIdLicenseNameMapping)[v143LicenseTaskID];

type v143Licenses = Partial<Record<v143LicenseName, v143LicenseDetails>>;

type v143LicenseData = {
  lastUpdatedISO: string;
  licenses?: v143Licenses;
};

type v143Preferences = {
  roadmapOpenSections: v143SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v143LicenseStatusItem = {
  title: string;
  status: v143CheckoffStatus;
};

type v143CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v143LicenseStatus =
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

const v143SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
type v143SectionType = (typeof v143SectionNames)[number];

type v143ExternalStatus = {
  newsletter?: v143NewsletterResponse;
  userTesting?: v143UserTestingResponse;
};

interface v143NewsletterResponse {
  success?: boolean;
  status: v143NewsletterStatus;
}

interface v143UserTestingResponse {
  success?: boolean;
  status: v143UserTestingStatus;
}

type v143NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v143UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v143NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v143NameAvailabilityResponse {
  status: v143NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v143NameAvailability extends v143NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v143FormationData {
  formationFormData: v143FormationFormData;
  businessNameAvailability: v143NameAvailability | undefined;
  dbaBusinessNameAvailability: v143NameAvailability | undefined;
  formationResponse: v143FormationSubmitResponse | undefined;
  getFilingResponse: v143GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v143InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v143FormationFormData extends v143FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v143BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v143InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v143InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v143InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v143InFormInBylaws;
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
  readonly members: v143FormationMember[] | undefined;
  readonly incorporators: v143FormationIncorporator[] | undefined;
  readonly signers: v143FormationSigner[] | undefined;
  readonly paymentType: v143PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v143StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v143ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v143ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v143StateObject = {
  shortCode: string;
  name: string;
};

interface v143FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v143StateObject;
  readonly addressMunicipality?: v143Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v143FormationBusinessLocationType | undefined;
}

type v143FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v143SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v143FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v143SignerTitle;
}

interface v143FormationIncorporator extends v143FormationSigner, v143FormationAddress {}

interface v143FormationMember extends v143FormationAddress {
  readonly name: string;
}

type v143PaymentType = "CC" | "ACH" | undefined;

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

type v143BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v143FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v143FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v143FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v143GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v143 generators ----------------

export const generatev143UserData = (overrides: Partial<v143UserData>): v143UserData => {
  return {
    user: generatev143BusinessUser({}),
    version: 140,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev143Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev143BusinessUser = (overrides: Partial<v143BusinessUser>): v143BusinessUser => {
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

export const generatev143Business = (overrides: Partial<v143Business>): v143Business => {
  const profileData = generatev143ProfileData({});
  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    profileData: profileData,
    preferences: generatev143Preferences({}),
    formationData: generatev143FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {
      "business-structure": "NOT_STARTED",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    licenseData: undefined,
    taxFilingData: generatev143TaxFilingData({}),
    ...overrides,
  };
};

export const generatev143ProfileData = (overrides: Partial<v143ProfileData>): v143ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev143IndustrySpecificData({}),
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
    municipality: undefined,
    responsibleOwnerName: `some-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    elevatorOwningBusiness: undefined,
    nonEssentialRadioAnswers: {},
    plannedRenovationQuestion: undefined,
    communityAffairsAddress: undefined,
    ...overrides,
  };
};

export const generatev143IndustrySpecificData = (
  overrides: Partial<v143IndustrySpecificData>
): v143IndustrySpecificData => {
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
    ...overrides,
  };
};

export const generatev143Preferences = (overrides: Partial<v143Preferences>): v143Preferences => {
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
    ...overrides,
  };
};

export const generatev143FormationData = (
  overrides: Partial<v143FormationData>,
  legalStructureId: string
): v143FormationData => {
  return {
    formationFormData: generatev143FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev143FormationFormData = (
  overrides: Partial<v143FormationFormData>,
  legalStructureId: string
): v143FormationFormData => {
  const isCorp = legalStructureId ? ["s-corporation", "c-corporation"].includes(legalStructureId) : false;

  return <v143FormationFormData>{
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
    addressMunicipality: generatev143Municipality({}),
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
    members: legalStructureId === "limited-liability-partnership" ? [] : [generatev143FormationMember({})],
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

export const generatev143Municipality = (overrides: Partial<v143Municipality>): v143Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev143FormationMember = (overrides: Partial<v143FormationMember>): v143FormationMember => {
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

export const generatev143TaxFilingData = (overrides: Partial<v143TaxFilingData>): v143TaxFilingData => {
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

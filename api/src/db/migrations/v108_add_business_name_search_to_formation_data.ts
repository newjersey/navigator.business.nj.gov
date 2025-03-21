import { v107UserData } from "@db/migrations/v107_refactor_interstate_transport_essential_question";
import { randomInt } from "@shared/intHelpers";

export interface v108UserData {
  user: v108BusinessUser;
  profileData: v108ProfileData;
  formProgress: v108FormProgress;
  taskProgress: Record<string, v108TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v108LicenseData | undefined;
  preferences: v108Preferences;
  taxFilingData: v108TaxFilingData;
  formationData: v108FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
}

export const migrate_v107_to_v108 = (v107Data: v107UserData): v108UserData => {
  return {
    ...v107Data,
    formationData: {
      ...v107Data.formationData,
      businessNameSearch: undefined,
    },
    version: 108,
  };
};

// ---------------- v108 types ----------------
type v108TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v108FormProgress = "UNSTARTED" | "COMPLETED";
type v108ABExperience = "ExperienceA" | "ExperienceB";

type v108BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v108ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v108ABExperience;
};

interface v108ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v108BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v108ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v108OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v108CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v108IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v108CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v108ProfileData extends v108IndustrySpecificData {
  businessPersona: v108BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v108Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v108ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v108ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v108OperatingPhase;
}

type v108Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v108TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v108TaxFilingErrorFields = "businessName" | "formFailure";

type v108TaxFilingData = {
  state?: v108TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v108TaxFilingErrorFields;
  businessName?: string;
  filings: v108TaxFiling[];
};

type v108TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v108NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v108LicenseData = {
  nameAndAddress: v108NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v108LicenseStatus;
  items: v108LicenseStatusItem[];
};

type v108Preferences = {
  roadmapOpenSections: v108SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v108LicenseStatusItem = {
  title: string;
  status: v108CheckoffStatus;
};

type v108CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v108LicenseStatus =
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

const v108SectionNames = ["PLAN", "START"] as const;
type v108SectionType = (typeof v108SectionNames)[number];

type v108ExternalStatus = {
  newsletter?: v108NewsletterResponse;
  userTesting?: v108UserTestingResponse;
};

interface v108NewsletterResponse {
  success?: boolean;
  status: v108NewsletterStatus;
}

interface v108UserTestingResponse {
  success?: boolean;
  status: v108UserTestingStatus;
}

type v108NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v108UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v108NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

type v108NameAvailability = {
  status: v108NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
};

type v108BusinessNameSearch = {
  businessNameAvailability: v108NameAvailability | undefined;
};

interface v108FormationData {
  formationFormData: v108FormationFormData;
  businessNameSearch: v108BusinessNameSearch | undefined;
  formationResponse: v108FormationSubmitResponse | undefined;
  getFilingResponse: v108GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v108FormationFormData extends v108FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v108BusinessSuffix | undefined;
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
  readonly provisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v108Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v108FormationMember[] | undefined;
  readonly incorporators: v108FormationIncorporator[] | undefined;
  readonly signers: v108FormationSigner[] | undefined;
  readonly paymentType: v108PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v108StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v108ForeignGoodStandingFileObject | undefined;
}

type v108ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v108StateObject = {
  shortCode: string;
  name: string;
};

interface v108FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v108StateObject;
  readonly addressMunicipality?: v108Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v108SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v108FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v108SignerTitle;
}

interface v108FormationIncorporator extends v108FormationSigner, v108FormationAddress {}

interface v108FormationMember extends v108FormationAddress {
  readonly name: string;
}

type v108PaymentType = "CC" | "ACH" | undefined;

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

const foreignCorpBusinessSuffix = [...corpBusinessSuffix, "P.C.", "P.A."] as const;

const AllBusinessSuffixes = [
  ...llcBusinessSuffix,
  ...llpBusinessSuffix,
  ...lpBusinessSuffix,
  ...foreignCorpBusinessSuffix,
] as const;

type v108BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v108FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v108FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v108FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v108GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v108 Factories ----------------
export const generateV108User = (overrides: Partial<v108BusinessUser>): v108BusinessUser => {
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

export const generateV108FormationMember = (overrides: Partial<v108FormationMember>): v108FormationMember => {
  return {
    name: `some-name`,
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    addressCity: `some-members-address-city-${randomInt()}`,
    addressState: { shortCode: "123", name: "new-jersey" },
    addressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    addressCountry: `some-county`,
    ...overrides,
  };
};

export const generateV108Municipality = (overrides: Partial<v108Municipality>): v108Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const allFormationLegalTypes = [
  "limited-liability-partnership",
  "limited-liability-company",
  "limited-partnership",
  "c-corporation",
  "s-corporation",
];

export const generateV108FormationFormData = (
  overrides: Partial<v108FormationFormData>,
  legalStructureId: string
): v108FormationFormData => {
  const isCorp = legalStructureId ? ["s-corporation", "c-corporation"].includes(legalStructureId) : false;

  return {
    businessName: `some-business-name-${randomInt()}`,
    businessSuffix: `some-suffix-${randomInt()}`,
    businessStartDate: new Date(Date.now()).toISOString().split("T")[0],
    businessAddressCity: generateV108Municipality({}),
    businessAddressLine1: `some-address-1-${randomInt()}`,
    businessAddressLine2: `some-address-2-${randomInt()}`,
    businessAddressState: "NJ",
    businessAddressZipCode: `some-zipcode-${randomInt()}`,
    businessTotalStock: isCorp ? randomInt().toString() : "",
    businessPurpose: `some-purpose-${randomInt()}`,
    provisions: [`some-provision-${randomInt()}`],
    agentNumberOrManual: randomInt() % 2 ? "NUMBER" : "MANUAL_ENTRY",
    agentNumber: `some-agent-number-${randomInt()}`,
    agentName: `some-agent-name-${randomInt()}`,
    agentEmail: `some-agent-email-${randomInt()}`,
    agentOfficeAddressLine1: `some-agent-office-address-1-${randomInt()}`,
    agentOfficeAddressLine2: `some-agent-office-address-2-${randomInt()}`,
    agentOfficeAddressCity: `some-agent-office-address-city-${randomInt()}`,
    agentOfficeAddressState: "NJ",
    agentOfficeAddressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    agentUseAccountInfo: !!(randomInt() % 2),
    agentUseBusinessAddress: !!(randomInt() % 2),
    signers: [{ name: "some-name", signature: "some-signature", title: "some-title" }],
    members: legalStructureId === "limited-liability-partnership" ? [] : [generateV108FormationMember({})],
    paymentType: randomInt() % 2 ? "ACH" : "CC",
    annualReportNotification: !!(randomInt() % 2),
    corpWatchNotification: !!(randomInt() % 2),
    officialFormationDocument: !!(randomInt() % 2),
    certificateOfStanding: !!(randomInt() % 2),
    certifiedCopyOfFormationDocument: !!(randomInt() % 2),
    contactFirstName: `some-contact-first-name-${randomInt()}`,
    contactLastName: `some-contact-last-name-${randomInt()}`,
    contactPhoneNumber: `some-contact-phone-number-${randomInt()}`,
    withdrawals: `some-withdrawals-text-${randomInt()}`,
    dissolution: `some-dissolution-text-${randomInt()}`,
    combinedInvestment: `some-combinedInvestment-text-${randomInt()}`,
    canCreateLimitedPartner: !!(randomInt() % 2),
    createLimitedPartnerTerms: `some-createLimitedPartnerTerms-text-${randomInt()}`,
    canGetDistribution: !!(randomInt() % 2),
    getDistributionTerms: `some-getDistributionTerms-text-${randomInt()}`,
    canMakeDistribution: !!(randomInt() % 2),
    makeDistributionTerms: `some-makeDistributionTerms-text-${randomInt()}`,
    ...overrides,
  } as v108FormationFormData;
};

export const generateV108IndustrySpecificData = (
  overrides: Partial<v108IndustrySpecificData>
): v108IndustrySpecificData => {
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
    isInterstateLogisticsApplicable: undefined,
    isInterstateMovingApplicable: undefined,
    ...overrides,
  };
};

export const generateV108ProfileData = (overrides: Partial<v108ProfileData>): v108ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generateV108IndustrySpecificData({}),
    businessPersona: persona,
    businessName: `some-business-name-${randomInt()}`,
    industryId: "restaurant",
    legalStructureId: "limited-liability-partnership",
    municipality: {
      name: `some-name-${randomInt()}`,
      displayName: `some-display-name-${randomInt()}`,
      county: `some-county-${randomInt()}`,
      id: `some-id-${randomInt()}`,
    },
    dateOfFormation: undefined,
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt() % 2 ? randomInt(9).toString() : randomInt(12).toString(),
    encryptedTaxId: `some-encrypted-value`,
    notes: `some-notes-${randomInt()}`,
    ownershipTypeIds: [],
    documents: {
      certifiedDoc: `${id}/certifiedDoc-${randomInt()}.pdf`,
      formationDoc: `${id}/formationDoc-${randomInt()}.pdf`,
      standingDoc: `${id}/standingDoc-${randomInt()}.pdf`,
    },
    existingEmployees: randomInt(7).toString(),
    taxPin: randomInt(4).toString(),
    sectorId: undefined,
    naicsCode: randomInt(6).toString(),
    foreignBusinessType: undefined,
    foreignBusinessTypeIds: [],
    nexusDbaName: "undefined",
    needsNexusDbaName: true,
    nexusLocationInNewJersey: undefined,
    operatingPhase: "NEEDS_TO_FORM",
    ...overrides,
  };
};

export const generateV108TaxFilingData = (overrides: Partial<v108TaxFilingData>): v108TaxFilingData => {
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

export const generateV108FormationData = (
  overrides: Partial<v108FormationData>,
  legalStructureId: string
): v108FormationData => {
  return {
    formationFormData: generateV108FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameSearch: undefined,
    ...overrides,
  };
};

export const generateV108UserData = (overrides: Partial<v108UserData>): v108UserData => {
  const profileData = generateV108ProfileData({});
  return {
    version: 108,
    user: generateV108User({}),
    profileData: generateV108ProfileData({}),
    formProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: generateV108Preferences({}),
    lastUpdatedISO: "",
    taxFilingData: generateV108TaxFilingData({}),
    formationData: generateV108FormationData({}, profileData.legalStructureId ?? ""),
    ...overrides,
  };
};

export const generateV108Preferences = (overrides: Partial<v108Preferences>): v108Preferences => {
  return {
    roadmapOpenSections: ["PLAN", "START"],
    roadmapOpenSteps: [],
    hiddenCertificationIds: [],
    hiddenFundingIds: [],
    visibleSidebarCards: ["welcome"],
    returnToLink: "",
    isCalendarFullView: true,
    isHideableRoadmapOpen: false,
    ...overrides,
  };
};

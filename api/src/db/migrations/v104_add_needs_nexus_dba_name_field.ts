import { v103UserData } from "@db/migrations/v103_change_tax_calendar_view_default";
import { randomInt } from "@shared/intHelpers";

export interface v104UserData {
  user: v104BusinessUser;
  profileData: v104ProfileData;
  formProgress: v104FormProgress;
  taskProgress: Record<string, v104TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v104LicenseData | undefined;
  preferences: v104Preferences;
  taxFilingData: v104TaxFilingData;
  formationData: v104FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
}

export const migrate_v103_to_v104 = (v103Data: v103UserData): v104UserData => {
  return {
    ...v103Data,
    profileData: {
      ...v103Data.profileData,
      nexusDbaName: v103Data.profileData.nexusDbaName ?? "",
      needsNexusDbaName: v103Data.profileData.nexusDbaName === undefined ? false : true,
    },
    version: 104,
  };
};

// ---------------- v104 types ----------------
type v104TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v104FormProgress = "UNSTARTED" | "COMPLETED";
type v104ABExperience = "ExperienceA" | "ExperienceB";

type v104BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v104ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v104ABExperience;
};

interface v104ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v104BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v104ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v104OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v104CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v104IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v104CarServiceType | undefined;
  interstateTransport: boolean;
  isChildcareForSixOrMore: boolean | undefined;
}

interface v104ProfileData extends v104IndustrySpecificData {
  businessPersona: v104BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v104Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v104ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v104ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v104OperatingPhase;
}

type v104Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v104TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v104TaxFilingErrorFields = "businessName" | "formFailure";

type v104TaxFilingData = {
  state?: v104TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v104TaxFilingErrorFields;
  businessName?: string;
  filings: v104TaxFiling[];
};

type v104TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v104NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v104LicenseData = {
  nameAndAddress: v104NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v104LicenseStatus;
  items: v104LicenseStatusItem[];
};

type v104Preferences = {
  roadmapOpenSections: v104SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v104LicenseStatusItem = {
  title: string;
  status: v104CheckoffStatus;
};

type v104CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v104LicenseStatus =
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

const v104SectionNames = ["PLAN", "START"] as const;
type v104SectionType = (typeof v104SectionNames)[number];

type v104ExternalStatus = {
  newsletter?: v104NewsletterResponse;
  userTesting?: v104UserTestingResponse;
};

interface v104NewsletterResponse {
  success?: boolean;
  status: v104NewsletterStatus;
}

interface v104UserTestingResponse {
  success?: boolean;
  status: v104UserTestingStatus;
}

type v104NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v104UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v104FormationData {
  formationFormData: v104FormationFormData;
  formationResponse: v104FormationSubmitResponse | undefined;
  getFilingResponse: v104GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v104FormationFormData extends v104FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v104BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v104Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v104FormationMember[] | undefined;
  readonly incorporators: v104FormationIncorporator[] | undefined;
  readonly signers: v104FormationSigner[] | undefined;
  readonly paymentType: v104PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v104StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v104ForeignGoodStandingFileObject | undefined;
}

type v104ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v104StateObject = {
  shortCode: string;
  name: string;
};

interface v104FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v104StateObject;
  readonly addressMunicipality?: v104Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v104SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v104FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v104SignerTitle;
}

interface v104FormationIncorporator extends v104FormationSigner, v104FormationAddress {}

interface v104FormationMember extends v104FormationAddress {
  readonly name: string;
}

type v104PaymentType = "CC" | "ACH" | undefined;

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

type v104BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v104FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v104FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v104FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v104GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// v104 Factories
export const generateV104User = (overrides: Partial<v104BusinessUser>): v104BusinessUser => {
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

export const generateV104FormationAddress = (
  overrides: Partial<v104FormationAddress>
): v104FormationAddress => {
  return {
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    addressCity: `some-members-address-city-${randomInt()}`,
    addressState: { shortCode: "NJ", name: "new-jersey" },
    addressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    addressCountry: `some-county`,
    ...overrides,
  };
};

export const generateV104FormationMember = (overrides: Partial<v104FormationMember>): v104FormationMember => {
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

export const generateV104Municipality = (overrides: Partial<v104Municipality>): v104Municipality => {
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

export const generateV104FormationFormData = (
  overrides: Partial<v104FormationFormData>,
  legalStructureId: string
): v104FormationFormData => {
  const isCorp = legalStructureId ? ["s-corporation", "c-corporation"].includes(legalStructureId) : false;

  return {
    businessName: `some-business-name-${randomInt()}`,
    businessSuffix: `some-suffix-${randomInt()}`,
    businessStartDate: new Date(Date.now()).toISOString().split("T")[0],
    businessAddressCity: generateV104Municipality({}),
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
    members: legalStructureId === "limited-liability-partnership" ? [] : [generateV104FormationMember({})],
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
  } as v104FormationFormData;
};

export const generateV104IndustrySpecificData = (
  overrides: Partial<v104IndustrySpecificData>
): v104IndustrySpecificData => {
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
    ...overrides,
  };
};

export const generateV104ProfileData = (overrides: Partial<v104ProfileData>): v104ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generateV104IndustrySpecificData({}),
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

export const generateV104TaxFilingData = (overrides: Partial<v104TaxFilingData>): v104TaxFilingData => {
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

export const generateV104FormationData = (
  overrides: Partial<v104FormationData>,
  legalStructureId: string
): v104FormationData => {
  return {
    formationFormData: generateV104FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    ...overrides,
  };
};

export const generateV104UserData = (overrides: Partial<v104UserData>): v104UserData => {
  const profileData = generateV104ProfileData({});
  return {
    version: 104,
    user: generateV104User({}),
    profileData: generateV104ProfileData({}),
    formProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: generateV104Preferences({}),
    lastUpdatedISO: "",
    taxFilingData: generateV104TaxFilingData({}),
    formationData: generateV104FormationData({}, profileData.legalStructureId ?? ""),
    ...overrides,
  };
};

export const generateV104Preferences = (overrides: Partial<v104Preferences>): v104Preferences => {
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

import { randomInt } from "@shared/intHelpers";
import { v99UserData } from "./v99_added_encrypted_tax_id";

export interface v100UserData {
  user: v100BusinessUser;
  profileData: v100ProfileData;
  formProgress: v100FormProgress;
  taskProgress: Record<string, v100TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v100LicenseData | undefined;
  preferences: v100Preferences;
  taxFilingData: v100TaxFilingData;
  formationData: v100FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
}

export const migrate_v99_to_v100 = (v99Data: v99UserData): v100UserData => {
  return {
    ...v99Data,
    licenseData: v99Data.licenseData
      ? {
          ...v99Data.licenseData,
          lastUpdatedISO: v99Data.licenseData?.lastCheckedStatus,
        }
      : undefined,
    formationData: {
      ...v99Data.formationData,
      formationResponse: v99Data.formationData.formationResponse
        ? {
            ...v99Data.formationData.formationResponse,
            lastUpdatedISO: undefined,
          }
        : undefined,
    },
    lastUpdatedISO: undefined,
    version: 100,
  };
};

// ---------------- v100 types ----------------
type v100TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v100FormProgress = "UNSTARTED" | "COMPLETED";
type v100ABExperience = "ExperienceA" | "ExperienceB";

type v100BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v100ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v100ABExperience;
};

interface v100ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v100BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v100ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v100OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v100CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v100IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v100CarServiceType | undefined;
  interstateTransport: boolean;
  isChildcareForSixOrMore: boolean | undefined;
}

interface v100ProfileData extends v100IndustrySpecificData {
  businessPersona: v100BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v100Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v100ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v100ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  operatingPhase: v100OperatingPhase;
}

type v100Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v100TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v100TaxFilingErrorFields = "Business Name" | "Taxpayer ID";

type v100TaxFilingData = {
  state?: v100TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v100TaxFilingErrorFields;
  businessName?: string;
  filings: v100TaxFiling[];
};

type v100TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v100NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v100LicenseData = {
  nameAndAddress: v100NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v100LicenseStatus;
  items: v100LicenseStatusItem[];
};

type v100Preferences = {
  roadmapOpenSections: v100SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v100LicenseStatusItem = {
  title: string;
  status: v100CheckoffStatus;
};

type v100CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v100LicenseStatus =
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

const v100SectionNames = ["PLAN", "START"] as const;
type v100SectionType = (typeof v100SectionNames)[number];

type v100ExternalStatus = {
  newsletter?: v100NewsletterResponse;
  userTesting?: v100UserTestingResponse;
};

interface v100NewsletterResponse {
  success?: boolean;
  status: v100NewsletterStatus;
}

interface v100UserTestingResponse {
  success?: boolean;
  status: v100UserTestingStatus;
}

type v100NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v100UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v100FormationData {
  formationFormData: v100FormationFormData;
  formationResponse: v100FormationSubmitResponse | undefined;
  getFilingResponse: v100GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v100FormationFormData extends v100FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v100BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v100Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v100FormationMember[] | undefined;
  readonly incorporators: v100FormationIncorporator[] | undefined;
  readonly signers: v100FormationSigner[] | undefined;
  readonly paymentType: v100PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v100StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v100ForeignGoodStandingFileObject | undefined;
}

type v100ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v100StateObject = {
  shortCode: string;
  name: string;
};

interface v100FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v100StateObject;
  readonly addressMunicipality?: v100Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v100SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v100FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v100SignerTitle;
}

interface v100FormationIncorporator extends v100FormationSigner, v100FormationAddress {}

interface v100FormationMember extends v100FormationAddress {
  readonly name: string;
}

type v100PaymentType = "CC" | "ACH" | undefined;

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

type v100BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v100FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v100FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v100FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v100GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v100 factories ----------------

export const v100generatorUser = (overrides: Partial<v100BusinessUser>): v100BusinessUser => {
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

export const v100generateFormationAddress = (
  overrides: Partial<v100FormationAddress>
): v100FormationAddress => {
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

export const v100generateFormationMember = (overrides: Partial<v100FormationMember>): v100FormationMember => {
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

export const generateMunicipality = (overrides: Partial<v100Municipality>): v100Municipality => {
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

export const v100generateFormationFormData = (
  overrides: Partial<v100FormationFormData>,
  legalStructureId: string
): v100FormationFormData => {
  const isCorp = legalStructureId ? ["s-corporation", "c-corporation"].includes(legalStructureId) : false;

  return {
    businessName: `some-business-name-${randomInt()}`,
    businessSuffix: `some-suffix-${randomInt()}`,
    businessStartDate: new Date(Date.now()).toISOString().split("T")[0],
    businessAddressCity: generateMunicipality({}),
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
    members: legalStructureId === "limited-liability-partnership" ? [] : [v100generateFormationMember({})],
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
  } as v100FormationFormData;
};

export const v100generatorIndustrySpecificData = (
  overrides: Partial<v100IndustrySpecificData>
): v100IndustrySpecificData => {
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

export const v100generatorProfileData = (overrides: Partial<v100ProfileData>): v100ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...v100generatorIndustrySpecificData({}),
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
    nexusDbaName: undefined,
    nexusLocationInNewJersey: undefined,
    operatingPhase: "NEEDS_TO_FORM",
    ...overrides,
  };
};

export const v100TaxFilingDataGenerator = (overrides: Partial<v100TaxFilingData>): v100TaxFilingData => {
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

export const v100FormationData = (
  overrides: Partial<v100FormationData>,
  legalStructureId: string
): v100FormationData => {
  return {
    formationFormData: v100generateFormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    ...overrides,
  };
};

export const v100UserDataGenerator = (overrides: Partial<v100UserData>): v100UserData => {
  const profileData = v100generatorProfileData({});
  return {
    version: 100,
    user: v100generatorUser({}),
    profileData,
    formProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
      hiddenCertificationIds: [],
      hiddenFundingIds: [],
      visibleSidebarCards: ["welcome"],
      returnToLink: "",
      isCalendarFullView: true,
      isHideableRoadmapOpen: false,
    },
    lastUpdatedISO: "",
    taxFilingData: v100TaxFilingDataGenerator({}),
    formationData: v100FormationData({}, profileData.legalStructureId ?? ""),
    ...overrides,
  };
};

import { v104UserData } from "./v104_add_needs_nexus_dba_name_field";

export interface v105UserData {
  user: v105BusinessUser;
  profileData: v105ProfileData;
  formProgress: v105FormProgress;
  taskProgress: Record<string, v105TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v105LicenseData | undefined;
  preferences: v105Preferences;
  taxFilingData: v105TaxFilingData;
  formationData: v105FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
}

export const migrate_v104_to_v105 = (v104Data: v104UserData): v105UserData => {
  return {
    ...v104Data,
    profileData: {
      ...v104Data.profileData,
      willSellPetCareItems: v104Data.profileData.industryId == "petcare" ? true : undefined,
    },
    version: 105,
  };
};

// ---------------- v105 types ----------------
type v105TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v105FormProgress = "UNSTARTED" | "COMPLETED";
type v105ABExperience = "ExperienceA" | "ExperienceB";

type v105BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v105ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v105ABExperience;
};

interface v105ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v105BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v105ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v105OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v105CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v105IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v105CarServiceType | undefined;
  interstateTransport: boolean;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
}

interface v105ProfileData extends v105IndustrySpecificData {
  businessPersona: v105BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v105Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v105ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v105ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v105OperatingPhase;
}

type v105Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v105TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v105TaxFilingErrorFields = "businessName" | "formFailure";

type v105TaxFilingData = {
  state?: v105TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v105TaxFilingErrorFields;
  businessName?: string;
  filings: v105TaxFiling[];
};

type v105TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v105NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v105LicenseData = {
  nameAndAddress: v105NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v105LicenseStatus;
  items: v105LicenseStatusItem[];
};

type v105Preferences = {
  roadmapOpenSections: v105SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v105LicenseStatusItem = {
  title: string;
  status: v105CheckoffStatus;
};

type v105CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v105LicenseStatus =
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

const v105SectionNames = ["PLAN", "START"] as const;
type v105SectionType = (typeof v105SectionNames)[number];

type v105ExternalStatus = {
  newsletter?: v105NewsletterResponse;
  userTesting?: v105UserTestingResponse;
};

interface v105NewsletterResponse {
  success?: boolean;
  status: v105NewsletterStatus;
}

interface v105UserTestingResponse {
  success?: boolean;
  status: v105UserTestingStatus;
}

type v105NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v105UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v105FormationData {
  formationFormData: v105FormationFormData;
  formationResponse: v105FormationSubmitResponse | undefined;
  getFilingResponse: v105GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v105FormationFormData extends v105FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v105BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v105Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v105FormationMember[] | undefined;
  readonly incorporators: v105FormationIncorporator[] | undefined;
  readonly signers: v105FormationSigner[] | undefined;
  readonly paymentType: v105PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v105StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v105ForeignGoodStandingFileObject | undefined;
}

type v105ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v105StateObject = {
  shortCode: string;
  name: string;
};

interface v105FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v105StateObject;
  readonly addressMunicipality?: v105Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v105SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v105FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v105SignerTitle;
}

interface v105FormationIncorporator extends v105FormationSigner, v105FormationAddress {}

interface v105FormationMember extends v105FormationAddress {
  readonly name: string;
}

type v105PaymentType = "CC" | "ACH" | undefined;

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

type v105BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v105FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v105FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v105FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v105GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

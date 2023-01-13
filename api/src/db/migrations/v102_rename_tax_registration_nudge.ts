import { v101UserData } from "./v101_change_error_field";

export interface v102UserData {
  user: v102BusinessUser;
  profileData: v102ProfileData;
  formProgress: v102FormProgress;
  taskProgress: Record<string, v102TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v102LicenseData | undefined;
  preferences: v102Preferences;
  taxFilingData: v102TaxFilingData;
  formationData: v102FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
}

export const migrate_v101_to_v102 = (v101Data: v101UserData): v102UserData => {
  const visibleSidebarCards: string[] = v101Data.preferences.visibleSidebarCards.reduce(
    (acc: string[], val: string) => {
      const newVal = val === "tax-registration-nudge" ? "registered-for-taxes-nudge" : val;
      return [...acc, newVal];
    },
    []
  );

  return {
    ...v101Data,
    preferences: {
      ...v101Data.preferences,
      visibleSidebarCards,
    },
    version: 102,
  };
};

// ---------------- v102 types ----------------
type v102TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v102FormProgress = "UNSTARTED" | "COMPLETED";
type v102ABExperience = "ExperienceA" | "ExperienceB";

type v102BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v102ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v102ABExperience;
};

interface v102ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v102BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v102ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v102OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v102CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v102IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v102CarServiceType | undefined;
  interstateTransport: boolean;
  isChildcareForSixOrMore: boolean | undefined;
}

interface v102ProfileData extends v102IndustrySpecificData {
  businessPersona: v102BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v102Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v102ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v102ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  operatingPhase: v102OperatingPhase;
}

type v102Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v102TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v102TaxFilingErrorFields = "businessName" | "formFailure";

type v102TaxFilingData = {
  state?: v102TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v102TaxFilingErrorFields;
  businessName?: string;
  filings: v102TaxFiling[];
};

type v102TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v102NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v102LicenseData = {
  nameAndAddress: v102NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v102LicenseStatus;
  items: v102LicenseStatusItem[];
};

type v102Preferences = {
  roadmapOpenSections: v102SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v102LicenseStatusItem = {
  title: string;
  status: v102CheckoffStatus;
};

type v102CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v102LicenseStatus =
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

const v102SectionNames = ["PLAN", "START"] as const;
type v102SectionType = (typeof v102SectionNames)[number];

type v102ExternalStatus = {
  newsletter?: v102NewsletterResponse;
  userTesting?: v102UserTestingResponse;
};

interface v102NewsletterResponse {
  success?: boolean;
  status: v102NewsletterStatus;
}

interface v102UserTestingResponse {
  success?: boolean;
  status: v102UserTestingStatus;
}

type v102NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v102UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v102FormationData {
  formationFormData: v102FormationFormData;
  formationResponse: v102FormationSubmitResponse | undefined;
  getFilingResponse: v102GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v102FormationFormData extends v102FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v102BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v102Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v102FormationMember[] | undefined;
  readonly incorporators: v102FormationIncorporator[] | undefined;
  readonly signers: v102FormationSigner[] | undefined;
  readonly paymentType: v102PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v102StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v102ForeignGoodStandingFileObject | undefined;
}

type v102ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v102StateObject = {
  shortCode: string;
  name: string;
};

interface v102FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v102StateObject;
  readonly addressMunicipality?: v102Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v102SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v102FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v102SignerTitle;
}

interface v102FormationIncorporator extends v102FormationSigner, v102FormationAddress {}

interface v102FormationMember extends v102FormationAddress {
  readonly name: string;
}

type v102PaymentType = "CC" | "ACH" | undefined;

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

type v102BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v102FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v102FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v102FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v102GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

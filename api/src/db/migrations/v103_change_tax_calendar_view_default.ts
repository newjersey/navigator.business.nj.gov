import { v102UserData } from "./v102_rename_tax_registration_nudge";

export interface v103UserData {
  user: v103BusinessUser;
  profileData: v103ProfileData;
  formProgress: v103FormProgress;
  taskProgress: Record<string, v103TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v103LicenseData | undefined;
  preferences: v103Preferences;
  taxFilingData: v103TaxFilingData;
  formationData: v103FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
}

export const migrate_v102_to_v103 = (v102Data: v102UserData): v103UserData => {
  const isUpAndRunning =
    v102Data.profileData.operatingPhase === "UP_AND_RUNNING_OWNING" ||
    v102Data.profileData.operatingPhase === "UP_AND_RUNNING";
  return {
    ...v102Data,
    preferences: {
      ...v102Data.preferences,
      isCalendarFullView: isUpAndRunning ? v102Data.preferences.isCalendarFullView : false,
    },
    version: 103,
  };
};

// ---------------- v103 types ----------------
type v103TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v103FormProgress = "UNSTARTED" | "COMPLETED";
type v103ABExperience = "ExperienceA" | "ExperienceB";

type v103BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v103ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v103ABExperience;
};

interface v103ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v103BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v103ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v103OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v103CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v103IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v103CarServiceType | undefined;
  interstateTransport: boolean;
  isChildcareForSixOrMore: boolean | undefined;
}

interface v103ProfileData extends v103IndustrySpecificData {
  businessPersona: v103BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v103Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v103ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v103ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  operatingPhase: v103OperatingPhase;
}

type v103Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v103TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v103TaxFilingErrorFields = "businessName" | "formFailure";

type v103TaxFilingData = {
  state?: v103TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v103TaxFilingErrorFields;
  businessName?: string;
  filings: v103TaxFiling[];
};

type v103TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v103NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v103LicenseData = {
  nameAndAddress: v103NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v103LicenseStatus;
  items: v103LicenseStatusItem[];
};

type v103Preferences = {
  roadmapOpenSections: v103SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v103LicenseStatusItem = {
  title: string;
  status: v103CheckoffStatus;
};

type v103CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v103LicenseStatus =
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

const v103SectionNames = ["PLAN", "START"] as const;
type v103SectionType = (typeof v103SectionNames)[number];

type v103ExternalStatus = {
  newsletter?: v103NewsletterResponse;
  userTesting?: v103UserTestingResponse;
};

interface v103NewsletterResponse {
  success?: boolean;
  status: v103NewsletterStatus;
}

interface v103UserTestingResponse {
  success?: boolean;
  status: v103UserTestingStatus;
}

type v103NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v103UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v103FormationData {
  formationFormData: v103FormationFormData;
  formationResponse: v103FormationSubmitResponse | undefined;
  getFilingResponse: v103GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v103FormationFormData extends v103FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v103BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v103Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v103FormationMember[] | undefined;
  readonly incorporators: v103FormationIncorporator[] | undefined;
  readonly signers: v103FormationSigner[] | undefined;
  readonly paymentType: v103PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v103StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v103ForeignGoodStandingFileObject | undefined;
}

type v103ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v103StateObject = {
  shortCode: string;
  name: string;
};

interface v103FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v103StateObject;
  readonly addressMunicipality?: v103Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v103SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v103FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v103SignerTitle;
}

interface v103FormationIncorporator extends v103FormationSigner, v103FormationAddress {}

interface v103FormationMember extends v103FormationAddress {
  readonly name: string;
}

type v103PaymentType = "CC" | "ACH" | undefined;

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

type v103BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v103FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v103FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v103FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v103GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

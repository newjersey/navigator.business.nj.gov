import { v97UserData } from "./v97_updating_formation_types";

export interface v98UserData {
  user: v98BusinessUser;
  profileData: v98ProfileData;
  formProgress: v98FormProgress;
  taskProgress: Record<string, v98TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v98LicenseData | undefined;
  preferences: v98Preferences;
  taxFilingData: v98TaxFilingData;
  formationData: v98FormationData;
  version: number;
}

export const migrate_v97_to_v98 = (v97Data: v97UserData): v98UserData => {
  return {
    ...v97Data,
    preferences: {
      ...v97Data.preferences,
      phaseNewlyChanged: false,
    },
    version: 98,
  };
};

// ---------------- v98 types ----------------

type v98TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v98FormProgress = "UNSTARTED" | "COMPLETED";
type v98ABExperience = "ExperienceA" | "ExperienceB";

type v98BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v98ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v98ABExperience;
};

interface v98ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v98BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v98ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v98OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v98CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v98IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v98CarServiceType | undefined;
  interstateTransport: boolean;
  isChildcareForSixOrMore: boolean | undefined;
}

interface v98ProfileData extends v98IndustrySpecificData {
  businessPersona: v98BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v98Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v98ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v98ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  operatingPhase: v98OperatingPhase;
}

type v98Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v98TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v98TaxFilingErrorFields = "Business Name" | "Taxpayer ID";

type v98TaxFilingData = {
  state?: v98TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v98TaxFilingErrorFields;
  businessName?: string;
  filings: v98TaxFiling[];
};

type v98TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v98NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v98LicenseData = {
  nameAndAddress: v98NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v98LicenseStatus;
  items: v98LicenseStatusItem[];
};

type v98Preferences = {
  roadmapOpenSections: v98SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v98LicenseStatusItem = {
  title: string;
  status: v98CheckoffStatus;
};

type v98CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v98LicenseStatus =
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

const v98SectionNames = ["PLAN", "START"] as const;
type v98SectionType = typeof v98SectionNames[number];

type v98ExternalStatus = {
  newsletter?: v98NewsletterResponse;
  userTesting?: v98UserTestingResponse;
};

interface v98NewsletterResponse {
  success?: boolean;
  status: v98NewsletterStatus;
}

interface v98UserTestingResponse {
  success?: boolean;
  status: v98UserTestingStatus;
}

type v98NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v98UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v98FormationData {
  formationFormData: v98FormationFormData;
  formationResponse: v98FormationSubmitResponse | undefined;
  getFilingResponse: v98GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v98FormationFormData extends v98FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v98BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v98Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v98FormationMember[] | undefined;
  readonly incorporators: v98FormationIncorporator[] | undefined;
  readonly signers: v98FormationSigner[] | undefined;
  readonly paymentType: v98PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v98StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v98ForeignGoodStandingFileObject | undefined;
}

type v98ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v98StateObject = {
  shortCode: string;
  name: string;
};

interface v98FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v98StateObject;
  readonly addressMunicipality?: v98Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v98SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v98FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v98SignerTitle;
}

interface v98FormationIncorporator extends v98FormationSigner, v98FormationAddress {}

interface v98FormationMember extends v98FormationAddress {
  readonly name: string;
}

type v98PaymentType = "CC" | "ACH" | undefined;

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

type v98BusinessSuffix = typeof AllBusinessSuffixes[number];

type v98FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v98FormationSubmitError[];
};

type v98FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v98GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

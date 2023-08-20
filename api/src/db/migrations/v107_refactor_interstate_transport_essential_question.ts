import { v106UserData } from "./v106_add_pet_care_housing_essential_question";

export interface v107UserData {
  user: v107BusinessUser;
  profileData: v107ProfileData;
  formProgress: v107FormProgress;
  taskProgress: Record<string, v107TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v107LicenseData | undefined;
  preferences: v107Preferences;
  taxFilingData: v107TaxFilingData;
  formationData: v107FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
}

export const migrate_v106_to_v107 = (v106Data: v106UserData): v107UserData => {
  const getLogisticsResponse = (): boolean => {
    if (v106Data.profileData.industryId === "logistics") {
      return v106Data.profileData.interstateTransport;
    }
    return false;
  };

  const getMovingResponse = (): boolean => {
    if (v106Data.profileData.industryId === "moving-company") {
      return v106Data.profileData.interstateTransport;
    }
    return false;
  };

  return {
    ...v106Data,
    profileData: {
      ...v106Data.profileData,
      isInterstateLogisticsApplicable: getLogisticsResponse(),
      isInterstateMovingApplicable: getMovingResponse(),
    },
    version: 107,
  };
};

// ---------------- v107 types ----------------
type v107TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v107FormProgress = "UNSTARTED" | "COMPLETED";
type v107ABExperience = "ExperienceA" | "ExperienceB";

type v107BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v107ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v107ABExperience;
};

interface v107ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v107BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v107ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v107OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v107CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v107IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v107CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v107ProfileData extends v107IndustrySpecificData {
  businessPersona: v107BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v107Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v107ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v107ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v107OperatingPhase;
}

type v107Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v107TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v107TaxFilingErrorFields = "businessName" | "formFailure";

type v107TaxFilingData = {
  state?: v107TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v107TaxFilingErrorFields;
  businessName?: string;
  filings: v107TaxFiling[];
};

type v107TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v107NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v107LicenseData = {
  nameAndAddress: v107NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v107LicenseStatus;
  items: v107LicenseStatusItem[];
};

type v107Preferences = {
  roadmapOpenSections: v107SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v107LicenseStatusItem = {
  title: string;
  status: v107CheckoffStatus;
};

type v107CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v107LicenseStatus =
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

const v107SectionNames = ["PLAN", "START"] as const;
type v107SectionType = (typeof v107SectionNames)[number];

type v107ExternalStatus = {
  newsletter?: v107NewsletterResponse;
  userTesting?: v107UserTestingResponse;
};

interface v107NewsletterResponse {
  success?: boolean;
  status: v107NewsletterStatus;
}

interface v107UserTestingResponse {
  success?: boolean;
  status: v107UserTestingStatus;
}

type v107NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v107UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v107FormationData {
  formationFormData: v107FormationFormData;
  formationResponse: v107FormationSubmitResponse | undefined;
  getFilingResponse: v107GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v107FormationFormData extends v107FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v107BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v107Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v107FormationMember[] | undefined;
  readonly incorporators: v107FormationIncorporator[] | undefined;
  readonly signers: v107FormationSigner[] | undefined;
  readonly paymentType: v107PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v107StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v107ForeignGoodStandingFileObject | undefined;
}

type v107ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v107StateObject = {
  shortCode: string;
  name: string;
};

interface v107FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v107StateObject;
  readonly addressMunicipality?: v107Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v107SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v107FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v107SignerTitle;
}

interface v107FormationIncorporator extends v107FormationSigner, v107FormationAddress {}

interface v107FormationMember extends v107FormationAddress {
  readonly name: string;
}

type v107PaymentType = "CC" | "ACH" | undefined;

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

type v107BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v107FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v107FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v107FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v107GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

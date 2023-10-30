import { v108UserData } from "@db/migrations/v108_add_business_name_search_to_formation_data";

export interface v109UserData {
  user: v109BusinessUser;
  profileData: v109ProfileData;
  formProgress: v109FormProgress;
  taskProgress: Record<string, v109TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v109LicenseData | undefined;
  preferences: v109Preferences;
  taxFilingData: v109TaxFilingData;
  formationData: v109FormationData;
  lastUpdatedISO: string | undefined;
  version: number;
}

export const migrate_v108_to_v109 = (v108Data: v108UserData): v109UserData => {
  return v108Data.formationData.businessNameSearch?.businessNameAvailability
    ? {
        ...v108Data,
        formationData: {
          ...v108Data.formationData,
          businessNameAvailability: {
            ...v108Data.formationData.businessNameSearch.businessNameAvailability,
            lastUpdatedTimeStamp: "2000-01-01T00:00:00.000Z",
          },
        },
        version: 109,
      }
    : {
        ...v108Data,
        formationData: {
          ...v108Data.formationData,
          businessNameAvailability: undefined,
        },
        version: 109,
      };
};

// ---------------- v109 types ----------------
type v109TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v109FormProgress = "UNSTARTED" | "COMPLETED";
type v109ABExperience = "ExperienceA" | "ExperienceB";

type v109BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v109ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v109ABExperience;
};

interface v109ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v109BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v109ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v109OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v109CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v109IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v109CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v109ProfileData extends v109IndustrySpecificData {
  businessPersona: v109BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v109Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v109ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v109ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v109OperatingPhase;
}

type v109Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v109TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v109TaxFilingErrorFields = "businessName" | "formFailure";

type v109TaxFilingData = {
  state?: v109TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v109TaxFilingErrorFields;
  businessName?: string;
  filings: v109TaxFiling[];
};

type v109TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v109NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v109LicenseData = {
  nameAndAddress: v109NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v109LicenseStatus;
  items: v109LicenseStatusItem[];
};

type v109Preferences = {
  roadmapOpenSections: v109SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v109LicenseStatusItem = {
  title: string;
  status: v109CheckoffStatus;
};

type v109CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v109LicenseStatus =
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

const v109SectionNames = ["PLAN", "START"] as const;
type v109SectionType = (typeof v109SectionNames)[number];

type v109ExternalStatus = {
  newsletter?: v109NewsletterResponse;
  userTesting?: v109UserTestingResponse;
};

interface v109NewsletterResponse {
  success?: boolean;
  status: v109NewsletterStatus;
}

interface v109UserTestingResponse {
  success?: boolean;
  status: v109UserTestingStatus;
}

type v109NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v109UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v109NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v109NameAvailabilityResponse {
  status: v109NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v109NameAvailability extends v109NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v109FormationData {
  formationFormData: v109FormationFormData;
  businessNameAvailability: v109NameAvailability | undefined;
  formationResponse: v109FormationSubmitResponse | undefined;
  getFilingResponse: v109GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v109FormationFormData extends v109FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v109BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v109Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v109FormationMember[] | undefined;
  readonly incorporators: v109FormationIncorporator[] | undefined;
  readonly signers: v109FormationSigner[] | undefined;
  readonly paymentType: v109PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v109StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v109ForeignGoodStandingFileObject | undefined;
}

type v109ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v109StateObject = {
  shortCode: string;
  name: string;
};

interface v109FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v109StateObject;
  readonly addressMunicipality?: v109Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v109SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v109FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v109SignerTitle;
}

interface v109FormationIncorporator extends v109FormationSigner, v109FormationAddress {}

interface v109FormationMember extends v109FormationAddress {
  readonly name: string;
}

type v109PaymentType = "CC" | "ACH" | undefined;

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

type v109BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v109FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v109FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v109FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v109GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

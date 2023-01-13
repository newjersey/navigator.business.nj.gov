import { v93UserData } from "./v93_merge_childcare_roadmaps";

export interface v94UserData {
  user: v94BusinessUser;
  profileData: v94ProfileData;
  formProgress: v94FormProgress;
  taskProgress: Record<string, v94TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v94LicenseData | undefined;
  preferences: v94Preferences;
  taxFilingData: v94TaxFilingData;
  formationData: v94FormationData;
  version: number;
}

export const migrate_v93_to_v94 = (v93Data: v93UserData): v94UserData => {
  const castedV93FormationFormData = v93Data.formationData.formationFormData as v94FormationFormData;
  return {
    ...v93Data,
    formationData: {
      ...v93Data.formationData,
      formationResponse: v93Data.formationData.formationResponse
        ? {
            ...v93Data.formationData.formationResponse,
            errors: v93Data.formationData.formationResponse.errors.flatMap((err) => {
              return (err as v94FormationSubmitError).type ? [err as v94FormationSubmitError] : [];
            }),
          }
        : undefined,
      formationFormData: {
        ...v93Data.formationData.formationFormData,
        withdrawals: castedV93FormationFormData.withdrawals ?? "",
        combinedInvestment: castedV93FormationFormData.combinedInvestment ?? "",
        dissolution: castedV93FormationFormData.dissolution ?? "",
        canCreateLimitedPartner: castedV93FormationFormData.canCreateLimitedPartner,
        createLimitedPartnerTerms: castedV93FormationFormData.createLimitedPartnerTerms ?? "",
        canGetDistribution: castedV93FormationFormData.canGetDistribution,
        getDistributionTerms: castedV93FormationFormData.getDistributionTerms ?? "",
        canMakeDistribution: castedV93FormationFormData.canMakeDistribution,
        makeDistributionTerms: castedV93FormationFormData.makeDistributionTerms ?? "",
      },
    },
    version: 94,
  };
};

// ---------------- v94 types ----------------

type v94TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v94FormProgress = "UNSTARTED" | "COMPLETED";
export type v94ABExperience = "ExperienceA" | "ExperienceB";

type v94BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v94ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v94ABExperience;
};

interface v94ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v94BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v94ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v94OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v94CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v94IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v94CarServiceType | undefined;
  interstateTransport: boolean;
  isChildcareForSixOrMore: boolean | undefined;
}

interface v94ProfileData extends v94IndustrySpecificData {
  businessPersona: v94BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v94Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v94ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v94ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  operatingPhase: v94OperatingPhase;
}

type v94Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v94TaxFilingState = "SUCCESS" | "FAILED" | "PENDING" | "API_ERROR";

type v94TaxFilingData = {
  state?: v94TaxFilingState;
  lastUpdatedISO?: string;
  businessName?: string;
  registered: boolean;
  filings: v94TaxFiling[];
};

type v94TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v94NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v94LicenseData = {
  nameAndAddress: v94NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v94LicenseStatus;
  items: v94LicenseStatusItem[];
};

type v94Preferences = {
  roadmapOpenSections: v94SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v94LicenseStatusItem = {
  title: string;
  status: v94CheckoffStatus;
};

type v94CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v94LicenseStatus =
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

const v94SectionNames = ["PLAN", "START"] as const;
type v94SectionType = (typeof v94SectionNames)[number];

type v94ExternalStatus = {
  newsletter?: v94NewsletterResponse;
  userTesting?: v94UserTestingResponse;
};

interface v94NewsletterResponse {
  success?: boolean;
  status: v94NewsletterStatus;
}

interface v94UserTestingResponse {
  success?: boolean;
  status: v94UserTestingStatus;
}

type v94NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v94UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v94FormationData {
  formationFormData: v94FormationFormData;
  formationResponse: v94FormationSubmitResponse | undefined;
  getFilingResponse: v94GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

export interface v94FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v94BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v94Municipality | undefined;
  readonly businessAddressLine1: string;
  readonly businessAddressLine2: string;
  readonly businessAddressState: string;
  readonly businessAddressZipCode: string;
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
  readonly provisions: string[];
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressState: string;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v94FormationAddress[];
  readonly signers: v94FormationAddress[];
  readonly paymentType: v94PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}
export interface v94FormationAddress {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  signature: boolean;
}

type v94PaymentType = "CC" | "ACH" | undefined;

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

export const corpBusinessSuffix = [
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

const AllBusinessSuffixes = [...llcBusinessSuffix, ...llpBusinessSuffix, ...corpBusinessSuffix] as const;

type v94BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v94FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v94FormationSubmitError[];
};

type v94FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v94GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

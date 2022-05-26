import { v60UserData } from "./v60_add_llp_suffix";

export interface v61UserData {
  user: v61BusinessUser;
  profileData: v61ProfileData;
  formProgress: v61FormProgress;
  taskProgress: Record<string, v61TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v61LicenseData | undefined;
  preferences: v61Preferences;
  taxFilingData: v61TaxFilingData;
  formationData: v61FormationData;
  version: number;
}

export const migrate_v60_to_v61 = (v60Data: v60UserData): v61UserData => {
  return {
    ...v60Data,
    formationData: {
      ...v60Data.formationData,
      formationFormData: {
        ...v60Data.formationData.formationFormData,
        businessTotalStock: "",
        signers: [
          { ...createEmptyFormationAddress(), ...v60Data.formationData.formationFormData.signer },
          ...v60Data.formationData.formationFormData.additionalSigners.map((signer) => ({
            ...createEmptyFormationAddress(),
            ...signer,
          })),
        ],
        members: v60Data.formationData.formationFormData.members.map((member) => ({
          ...member,
          signature: false,
        })),
      },
    },
    version: 61,
  };
};

// ---------------- v61 types ----------------

type v61TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v61FormProgress = "UNSTARTED" | "COMPLETED";
export type v61ABExperience = "ExperienceA" | "ExperienceB";

type v61BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v61ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v61ABExperience;
};

interface v61ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}
interface v61ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v61Municipality | undefined;
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v61ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
}

type v61Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v61TaxFilingData = {
  filings: v61TaxFiling[];
};

type v61TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v61NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v61LicenseData = {
  nameAndAddress: v61NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v61LicenseStatus;
  items: v61LicenseStatusItem[];
};

type v61Preferences = {
  roadmapOpenSections: v61SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
};

type v61LicenseStatusItem = {
  title: string;
  status: v61CheckoffStatus;
};

type v61CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v61LicenseStatus =
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

type v61SectionType = "PLAN" | "START";

type v61ExternalStatus = {
  newsletter?: v61NewsletterResponse;
  userTesting?: v61UserTestingResponse;
};

interface v61NewsletterResponse {
  success?: boolean;
  status: v61NewsletterStatus;
}

interface v61UserTestingResponse {
  success?: boolean;
  status: v61UserTestingStatus;
}

type v61NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v61UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v61FormationData {
  formationFormData: v61FormationFormData;
  formationResponse: v61FormationSubmitResponse | undefined;
  getFilingResponse: v61GetFilingResponse | undefined;
}

interface v61FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: v61BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: v61Municipality | undefined;
  readonly businessAddressLine1: string;
  readonly businessAddressLine2: string;
  readonly businessAddressState: string;
  readonly businessAddressZipCode: string;
  readonly businessPurpose: string;
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
  readonly members: v61FormationAddress[];
  readonly signers: v61FormationAddress[];
  readonly paymentType: v61PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export interface v61FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

type v61PaymentType = "CC" | "ACH" | undefined;

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

export const createEmptyFormationAddress = (): v61FormationAddress => ({
  name: "",
  addressLine1: "",
  addressLine2: "",
  addressCity: "",
  addressState: "",
  addressZipCode: "",
  signature: false,
});

const AllBusinessSuffixes = [...llcBusinessSuffix, ...llpBusinessSuffix, ...corpBusinessSuffix] as const;

type v61BusinessSuffix = typeof AllBusinessSuffixes[number];

type v61FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v61FormationSubmitError[];
};

type v61FormationSubmitError = {
  field: string;
  message: string;
};

type v61GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v61 factories ----------------

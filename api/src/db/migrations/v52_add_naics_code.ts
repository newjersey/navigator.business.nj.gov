import { v51UserData } from "./v51_add_cpa_field";

export interface v52UserData {
  readonly user: v52BusinessUser;
  readonly profileData: v52ProfileData;
  readonly formProgress: v52FormProgress;
  readonly taskProgress: Record<string, v52TaskProgress>;
  readonly taskItemChecklist: Record<string, boolean>;
  readonly licenseData: v52LicenseData | undefined;
  readonly preferences: v52Preferences;
  readonly taxFilingData: v52TaxFilingData;
  readonly formationData: v52FormationData;
  readonly version: number;
}

export const migrate_v51_to_v52 = (v51Data: v51UserData): v52UserData => {
  return {
    ...v51Data,
    profileData: {
      ...v51Data.profileData,
      naicsCode: "",
    },
    version: 52,
  };
};

// ---------------- v52 types ----------------

type v52TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v52FormProgress = "UNSTARTED" | "COMPLETED";
export type v52ABExperience = "ExperienceA" | "ExperienceB";

type v52BusinessUser = {
  readonly name?: string;
  readonly email: string;
  readonly id: string;
  readonly receiveNewsletter: boolean;
  readonly userTesting: boolean;
  readonly externalStatus: v52ExternalStatus;
  readonly myNJUserKey?: string;
  readonly intercomHash?: string;
  readonly abExperience: v52ABExperience;
};

interface v52ProfileDocuments {
  readonly formationDoc: string;
  readonly standingDoc: string;
  readonly certifiedDoc: string;
}
interface v52ProfileData {
  readonly hasExistingBusiness: boolean | undefined;
  readonly initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  readonly businessName: string;
  readonly industryId: string | undefined;
  readonly legalStructureId: string | undefined;
  readonly municipality: v52Municipality | undefined;
  readonly liquorLicense: boolean;
  readonly requiresCpa: boolean;
  readonly homeBasedBusiness: boolean;
  readonly cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  readonly constructionRenovationPlan: boolean | undefined;
  readonly dateOfFormation: string | undefined;
  readonly entityId: string | undefined;
  readonly employerId: string | undefined;
  readonly taxId: string | undefined;
  readonly notes: string;
  readonly documents: v52ProfileDocuments;
  readonly ownershipTypeIds: readonly string[];
  readonly existingEmployees: string | undefined;
  readonly taxPin: string | undefined;
  readonly sectorId: string | undefined;
  readonly naicsCode: string;
}

type v52Municipality = {
  readonly name: string;
  readonly displayName: string;
  readonly county: string;
  readonly id: string;
};

type v52TaxFilingData = {
  readonly filings: readonly v52TaxFiling[];
};

type v52TaxFiling = {
  readonly identifier: string;
  readonly dueDate: string;
};

type v52NameAndAddress = {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly zipCode: string;
};

type v52LicenseData = {
  readonly nameAndAddress: v52NameAndAddress;
  readonly completedSearch: boolean;
  readonly lastCheckedStatus: string;
  readonly status: v52LicenseStatus;
  readonly items: readonly v52LicenseStatusItem[];
};

type v52Preferences = {
  readonly roadmapOpenSections: readonly v52SectionType[];
  readonly roadmapOpenSteps: readonly number[];
  readonly hiddenFundingIds: readonly string[];
  readonly hiddenCertificationIds: readonly string[];
};

type v52LicenseStatusItem = {
  readonly title: string;
  readonly status: v52CheckoffStatus;
};

type v52CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v52LicenseStatus =
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

type v52SectionType = "PLAN" | "START";

type v52ExternalStatus = {
  readonly newsletter?: v52NewsletterResponse;
  readonly userTesting?: v52UserTestingResponse;
};

interface v52NewsletterResponse {
  readonly success?: boolean;
  readonly status: v52NewsletterStatus;
}

interface v52UserTestingResponse {
  readonly success?: boolean;
  readonly status: v52UserTestingStatus;
}

type v52NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v52UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v52FormationData {
  readonly formationFormData: v52FormationFormData;
  readonly formationResponse: v52FormationSubmitResponse | undefined;
  readonly getFilingResponse: v52GetFilingResponse | undefined;
}

interface v52FormationMember {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
}

interface v52FormationFormData {
  readonly businessSuffix: v52BusinessSuffix | undefined;
  readonly businessStartDate: string;
  readonly businessAddressLine1: string;
  readonly businessAddressLine2: string;
  readonly businessAddressState: string;
  readonly businessAddressZipCode: string;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressState: string;
  readonly agentOfficeAddressZipCode: string;
  readonly members: readonly v52FormationMember[];
  readonly signer: string;
  readonly additionalSigners: readonly string[];
  readonly paymentType: v52PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

type v52PaymentType = "CC" | "ACH" | undefined;

type v52BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v52FormationSubmitResponse = {
  readonly success: boolean;
  readonly token: string | undefined;
  readonly formationId: string | undefined;
  readonly redirect: string | undefined;
  readonly errors: readonly v52FormationSubmitError[];
};

type v52FormationSubmitError = {
  readonly field: string;
  readonly message: string;
};

type v52GetFilingResponse = {
  readonly success: boolean;
  readonly entityId: string;
  readonly transactionDate: string;
  readonly confirmationNumber: string;
  readonly formationDoc: string;
  readonly standingDoc: string;
  readonly certifiedDoc: string;
};

// ---------------- v52 factories ----------------

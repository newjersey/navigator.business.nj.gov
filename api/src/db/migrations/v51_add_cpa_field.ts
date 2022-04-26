import { v50UserData } from "./v50_fix_annual_conditional_ids";

export interface v51UserData {
  readonly user: v51BusinessUser;
  readonly profileData: v51ProfileData;
  readonly formProgress: v51FormProgress;
  readonly taskProgress: Record<string, v51TaskProgress>;
  readonly taskItemChecklist: Record<string, boolean>;
  readonly licenseData: v51LicenseData | undefined;
  readonly preferences: v51Preferences;
  readonly taxFilingData: v51TaxFilingData;
  readonly formationData: v51FormationData;
  readonly version: number;
}

export const migrate_v50_to_v51 = (v50Data: v50UserData): v51UserData => {
  return {
    ...v50Data,
    profileData: {
      ...v50Data.profileData,
      requiresCpa: v50Data.profileData.industryId === "certified-public-accountant" ? true : false,
    },
    version: 51,
  };
};

// ---------------- v51 types ----------------

type v51TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v51FormProgress = "UNSTARTED" | "COMPLETED";
export type v51ABExperience = "ExperienceA" | "ExperienceB";

type v51BusinessUser = {
  readonly name?: string;
  readonly email: string;
  readonly id: string;
  readonly receiveNewsletter: boolean;
  readonly userTesting: boolean;
  readonly externalStatus: v51ExternalStatus;
  readonly myNJUserKey?: string;
  readonly intercomHash?: string;
  readonly abExperience: v51ABExperience;
};

interface v51ProfileDocuments {
  readonly formationDoc: string;
  readonly standingDoc: string;
  readonly certifiedDoc: string;
}
interface v51ProfileData {
  readonly hasExistingBusiness: boolean | undefined;
  readonly initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  readonly businessName: string;
  readonly industryId: string | undefined;
  readonly legalStructureId: string | undefined;
  readonly municipality: v51Municipality | undefined;
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
  readonly documents: v51ProfileDocuments;
  readonly ownershipTypeIds: readonly string[];
  readonly existingEmployees: string | undefined;
  readonly taxPin: string | undefined;
  readonly sectorId: string | undefined;
}

type v51Municipality = {
  readonly name: string;
  readonly displayName: string;
  readonly county: string;
  readonly id: string;
};

type v51TaxFilingData = {
  readonly filings: readonly v51TaxFiling[];
};

type v51TaxFiling = {
  readonly identifier: string;
  readonly dueDate: string;
};

type v51NameAndAddress = {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly zipCode: string;
};

type v51LicenseData = {
  readonly nameAndAddress: v51NameAndAddress;
  readonly completedSearch: boolean;
  readonly lastCheckedStatus: string;
  readonly status: v51LicenseStatus;
  readonly items: readonly v51LicenseStatusItem[];
};

type v51Preferences = {
  readonly roadmapOpenSections: readonly v51SectionType[];
  readonly roadmapOpenSteps: readonly number[];
  readonly hiddenFundingIds: readonly string[];
  readonly hiddenCertificationIds: readonly string[];
};

type v51LicenseStatusItem = {
  readonly title: string;
  readonly status: v51CheckoffStatus;
};

type v51CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v51LicenseStatus =
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

type v51SectionType = "PLAN" | "START";

type v51ExternalStatus = {
  readonly newsletter?: v51NewsletterResponse;
  readonly userTesting?: v51UserTestingResponse;
};

interface v51NewsletterResponse {
  readonly success?: boolean;
  readonly status: v51NewsletterStatus;
}

interface v51UserTestingResponse {
  readonly success?: boolean;
  readonly status: v51UserTestingStatus;
}

type v51NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v51UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v51FormationData {
  readonly formationFormData: v51FormationFormData;
  readonly formationResponse: v51FormationSubmitResponse | undefined;
  readonly getFilingResponse: v51GetFilingResponse | undefined;
}

interface v51FormationMember {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
}

interface v51FormationFormData {
  readonly businessSuffix: v51BusinessSuffix | undefined;
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
  readonly members: readonly v51FormationMember[];
  readonly signer: string;
  readonly additionalSigners: readonly string[];
  readonly paymentType: v51PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

type v51PaymentType = "CC" | "ACH" | undefined;

type v51BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

type v51FormationSubmitResponse = {
  readonly success: boolean;
  readonly token: string | undefined;
  readonly formationId: string | undefined;
  readonly redirect: string | undefined;
  readonly errors: readonly v51FormationSubmitError[];
};

type v51FormationSubmitError = {
  readonly field: string;
  readonly message: string;
};

type v51GetFilingResponse = {
  readonly success: boolean;
  readonly entityId: string;
  readonly transactionDate: string;
  readonly confirmationNumber: string;
  readonly formationDoc: string;
  readonly standingDoc: string;
  readonly certifiedDoc: string;
};

// ---------------- v51 factories ----------------

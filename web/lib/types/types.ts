export interface UserData {
  user: BusinessUser;
  onboardingData: OnboardingData;
  formProgress: FormProgress;
  taskProgress: Record<string, TaskProgress>;
  licenseData: LicenseData | undefined;
}

export type FormProgress = "UNSTARTED" | "COMPLETED";
export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type UserDataError = "NO_DATA" | "CACHED_ONLY" | "UPDATE_FAILED";

export const createEmptyUserData = (user: BusinessUser): UserData => {
  return {
    user: user,
    onboardingData: createEmptyOnboardingData(),
    formProgress: "UNSTARTED",
    taskProgress: {},
    licenseData: undefined,
  };
};

export const createEmptyOnboardingData = (): OnboardingData => {
  return {
    businessName: "",
    industry: undefined,
    legalStructure: undefined,
    municipality: undefined,
    liquorLicense: false,
    homeBasedBusiness: false,
    constructionRenovationPlan: undefined,
  };
};

export interface OnboardingData {
  businessName: string;
  industry: Industry | undefined;
  legalStructure: LegalStructure | undefined;
  municipality: Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
}

export interface LicenseData {
  nameAndAddress: NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: LicenseStatus;
  items: LicenseStatusItem[];
}

export type OnboardingDisplayContent = {
  businessName: {
    contentMd: string;
    placeholder: string;
  };
  industry: {
    contentMd: string;
    placeholder: string;
    infoAlertMd: string;
    specificHomeContractorMd: string;
    specificLiquorQuestion: {
      contentMd: string;
      radioButtonYesText: string;
      radioButtonNoText: string;
    };
    specificHomeBasedBusinessQuestion: {
      contentMd: string;
      radioButtonYesText: string;
      radioButtonNoText: string;
    };
  };
  legalStructure: {
    contentMd: string;
    optionContent: Record<LegalStructure, string>;
  };
  municipality: {
    contentMd: string;
    placeholder: string;
  };
};

export const createEmptyOnboardingDisplayContent = (): OnboardingDisplayContent => {
  return {
    businessName: {
      contentMd: "",
      placeholder: "",
    },
    industry: {
      contentMd: "",
      placeholder: "",
      infoAlertMd: "",
      specificHomeContractorMd: "",
      specificLiquorQuestion: {
        contentMd: "",
        radioButtonYesText: "",
        radioButtonNoText: "",
      },
      specificHomeBasedBusinessQuestion: {
        contentMd: "",
        radioButtonYesText: "",
        radioButtonNoText: "",
      },
    },
    legalStructure: {
      contentMd: "",
      optionContent: {
        "sole-proprietorship": "",
        "general-partnership": "",
        "limited-partnership": "",
        "limited-liability-partnership": "",
        "limited-liability-company": "",
        "c-corporation": "",
      },
    },
    municipality: {
      contentMd: "",
      placeholder: "",
    },
  };
};

export type RoadmapDisplayContent = {
  contentMd: string;
};

export type Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type MunicipalityDetail = {
  id: string;
  townName: string;
  townDisplayName: string;
  townWebsite: string;
  countyId: string;
  countyName: string;
  countyClerkPhone: string;
  countyClerkWebsite: string;
  countyWebsite: string;
};

export interface Roadmap {
  steps: Step[];
}

export interface Step {
  step_number: number;
  name: string;
  timeEstimate: string;
  description: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  contentMd: string;
  postOnboardingQuestion?: string;
}

export interface PostOnboarding {
  question: string;
  contentMd: string;
  radioYes: string;
  radioNo: string;
  radioNoContent: string;
}

export type Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";

export type LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation";

export type BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

export interface SessionHelper {
  getCurrentToken: () => Promise<string>;
  getCurrentUser: () => Promise<BusinessUser>;
}

export interface AuthenticationHelper {
  onSignIn: () => Promise<void>;
  onSignOut: () => void;
}

export type NameAvailability = {
  status: "AVAILABLE" | "UNAVAILABLE";
  similarNames: string[];
};

export type NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export const createEmptyNameAndAddress = (): NameAndAddress => ({
  name: "",
  addressLine1: "",
  addressLine2: "",
  zipCode: "",
});

export type LicenseStatusItem = {
  title: string;
  status: CheckoffStatus;
};

export type LicenseStatusResult = {
  status: LicenseStatus;
  checklistItems: LicenseStatusItem[];
};

export type CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type LicenseStatus =
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

export type SelfRegResponse = {
  authRedirectURL: string;
};

export type SelfRegRequest = {
  name: string;
  email: string;
  confirmEmail: string;
};

import { Municipality } from "@businessnjgovnavigator/shared";

export interface UserData {
  user: BusinessUser;
  profileData: ProfileData;
  formProgress: FormProgress;
  taskProgress: Record<string, TaskProgress>;
  licenseData: LicenseData | undefined;
  preferences: Preferences;
  taxFilingData: TaxFilingData;
}

export type TaxFilingData = {
  entityIdStatus: EntityIdStatus;
  filings: TaxFiling[];
};

export type EntityIdStatus = "UNKNOWN" | "EXISTS_AND_REGISTERED" | "EXISTS_NOT_REGISTERED" | "NOT_FOUND";

export type TaxFiling = {
  identifier: string;
  dueDate: string;
};

export type FormProgress = "UNSTARTED" | "COMPLETED";
export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type UserDataError = "NO_DATA" | "CACHED_ONLY" | "UPDATE_FAILED";

export const createEmptyUserData = (user: BusinessUser): UserData => {
  return {
    user: user,
    profileData: createEmptyProfileData(),
    formProgress: "UNSTARTED",
    taskProgress: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
    },
    taxFilingData: {
      entityIdStatus: "UNKNOWN",
      filings: [],
    },
  };
};

export interface Preferences {
  roadmapOpenSections: SectionType[];
  roadmapOpenSteps: number[];
}

const emptyProfileData = {
  businessName: "",
  industryId: undefined,
  legalStructureId: undefined,
  municipality: undefined,
  liquorLicense: false,
  homeBasedBusiness: false,
  constructionRenovationPlan: undefined,
  dateOfFormation: undefined,
  entityId: undefined,
  employerId: undefined,
  taxId: undefined,
  notes: "",
} as ProfileData;

export const createEmptyProfileData = (): ProfileData => {
  return emptyProfileData;
};

export interface ProfileData {
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
}

export type ProfileError = "REQUIRED_LEGAL";
export interface LicenseData {
  nameAndAddress: NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: LicenseStatus;
  items: LicenseStatusItem[];
}

export type OperateDisplayContent = {
  entityIdMd: string;
  filingCalendarMd: string;
  entityIdErrorNotFoundMd: string;
  entityIdErrorNotRegisteredMd: string;
};

export type ProfileDisplayContent = {
  businessName: {
    contentMd: string;
    placeholder: string;
  };
  industry: {
    contentMd: string;
    placeholder: string;
    specificHomeContractorMd: string;
    specificEmploymentAgencyMd: string;
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
    optionContent: Record<string, string>;
  };
  municipality: {
    contentMd: string;
    placeholder: string;
  };
  notes: {
    contentMd: string;
  };
  taxId: {
    contentMd: string;
  };
  employerId: {
    contentMd: string;
  };
  entityId: {
    contentMd: string;
  };
};

const emptyProfileDisplayContent = {
  businessName: {
    contentMd: "",
    placeholder: "",
  },
  industry: {
    contentMd: "",
    placeholder: "",
    specificHomeContractorMd: "",
    specificEmploymentAgencyMd: "",
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
  notes: {
    contentMd: "",
  },
  taxId: {
    contentMd: "",
  },
  employerId: {
    contentMd: "",
  },
  entityId: {
    contentMd: "",
  },
} as ProfileDisplayContent;

export const createEmptyProfileDisplayContent = (): ProfileDisplayContent => {
  return emptyProfileDisplayContent;
};

export type ProfileFields = keyof ProfileData & keyof ProfileDisplayContent;
const profileDisplayContentFields = Object.keys(
  emptyProfileDisplayContent
) as (keyof ProfileDisplayContent)[];

const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];

export const profileFields = [
  ...new Set([...profileDisplayContentFields, ...onboardingDataFields]),
] as ProfileFields[];

export type OnboardingStatus = "SUCCESS" | "ERROR";

type ProfileFieldStatus = {
  invalid: boolean;
};
export type ProfileFieldErrorMap = Record<ProfileFields, ProfileFieldStatus>;

export const createProfileFieldErrorMap = (): ProfileFieldErrorMap =>
  profileFields.reduce((p, c: ProfileFields) => {
    p[c] = { invalid: false };
    return p;
  }, {} as ProfileFieldErrorMap);

export type RoadmapDisplayContent = {
  contentMd: string;
  operateDisplayContent: OperateDisplayContent;
};

export interface Roadmap {
  steps: Step[];
}

export interface RoadmapStatus {
  sectionCompletion: SectionCompletion;
}

export type SectionCompletion = Record<SectionType, boolean>;

export const sectionNames = ["PLAN", "START", "OPERATE"] as const;

export type SectionType = typeof sectionNames[number];

export interface Step {
  step_number: number;
  name: string;
  timeEstimate: string;
  description: string;
  tasks: Task[];
  section: SectionType;
}

export interface Task {
  id: string;
  filename: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  contentMd: string;
  postOnboardingQuestion?: string;
  unlockedBy: TaskLink[];
  unlocks: TaskLink[];
}

export interface TaskLink {
  name: string;
  id: string;
  urlSlug: string;
  filename: string;
}

export type TaskDependencies = {
  [filename: string]: string[];
};

export interface Filing {
  id: string;
  filename: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  contentMd: string;
}

export type FilingReference = {
  name: string;
  urlSlug: string;
};

export interface PostOnboarding {
  question: string;
  contentMd: string;
  radioYes: string;
  radioNo: string;
  radioNoContent: string;
}

export type BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
  intercomHash?: string;
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

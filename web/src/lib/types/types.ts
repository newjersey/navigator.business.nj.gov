import { getMergedConfig } from "@/contexts/configContext";
import {
  BusinessUser,
  FormationFormData,
  FormationLegalType,
  FormationLegalTypes,
  PaymentType,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { emptyBusinessUser } from "@businessnjgovnavigator/shared/businessUser";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import merge from "lodash.merge";

// returns all keys in an object of a type
// e.g. KeysOfType<Task, boolean> will give all keys in the Task that have boolean types
export type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type UserDataError = "NO_DATA" | "CACHED_ONLY" | "UPDATE_FAILED";

export type ProfileError = "REQUIRED_LEGAL" | "REQUIRED_EXISTING_BUSINESS";

export type FlowType = "OWNING" | "STARTING";

export type CannabisPriorityStatusDisplayContent = {
  socialEquityBusiness: { contentMd: string };
  minorityAndWomenOwned: { contentMd: string };
  veteranOwned: { contentMd: string };
};

export type CannabisApplyForLicenseDisplayContent = {
  annualGeneralRequirements: { contentMd: string };
  conditionalGeneralRequirements: { contentMd: string };
  diverselyOwnedRequirements: { contentMd: string };
  impactZoneRequirements: { contentMd: string };
  microbusinessRequirements: { contentMd: string };
  socialEquityRequirements: { contentMd: string };
  conditionalBottomOfTask: { contentMd: string };
  annualBottomOfTask: { contentMd: string };
};

export type FormationDisplayContent = {
  introParagraph: { contentMd: string };
  businessNameCheck: { contentMd: string };
  agentNumberOrManual: {
    contentMd: string;
    radioButtonNumberText: string;
    radioButtonManualText: string;
  };
  members: {
    contentMd: string;
    placeholder?: string;
  };
  signatureHeader: {
    contentMd: string;
    placeholder?: string;
  };
  services: {
    contentMd: string;
  };
  notification: {
    contentMd: string;
  };
  officialFormationDocument: {
    contentMd: string;
    cost: number;
  };
  certificateOfStanding: {
    contentMd: string;
    cost: number;
    optionalLabel: string;
  };
  certifiedCopyOfFormationDocument: {
    contentMd: string;
    cost: number;
    optionalLabel: string;
  };
};

export const createEmptyTaskDisplayContent = (): TasksDisplayContent => ({
  formationDisplayContent: createEmptyFormationDisplayContent(),
  cannabisPriorityStatusDisplayContent: createEmptyCannabisPriorityStatusDisplayContent(),
  cannabisApplyForLicenseDisplayContent: createEmptyCannabisApplyForLicenseDisplayContent(),
});

export type AllPaymentTypes = { type: PaymentType; displayText: string }[];

export const createEmptyCannabisPriorityStatusDisplayContent = (): CannabisPriorityStatusDisplayContent => ({
  socialEquityBusiness: { contentMd: "" },
  minorityAndWomenOwned: { contentMd: "" },
  veteranOwned: { contentMd: "" },
});

export const createEmptyCannabisApplyForLicenseDisplayContent =
  (): CannabisApplyForLicenseDisplayContent => ({
    annualGeneralRequirements: { contentMd: "" },
    conditionalGeneralRequirements: { contentMd: "" },
    diverselyOwnedRequirements: { contentMd: "" },
    impactZoneRequirements: { contentMd: "" },
    microbusinessRequirements: { contentMd: "" },
    socialEquityRequirements: { contentMd: "" },
    conditionalBottomOfTask: { contentMd: "" },
    annualBottomOfTask: { contentMd: "" },
  });

export const createEmptyFormationDisplayContent = (): FormationDisplayContentMap =>
  FormationLegalTypes.reduce((accumulator, curr) => {
    accumulator[curr] = {
      introParagraph: {
        contentMd: "",
      },
      businessNameCheck: {
        contentMd: "",
      },
      agentNumberOrManual: {
        contentMd: "",
        radioButtonNumberText: "",
        radioButtonManualText: "",
      },
      members: {
        contentMd: "",
        placeholder: "",
      },
      signatureHeader: {
        contentMd: "",
        placeholder: "",
      },
      services: {
        contentMd: "",
      },
      notification: {
        contentMd: "",
      },
      officialFormationDocument: {
        contentMd: "",
        cost: 0,
      },
      certificateOfStanding: {
        contentMd: "",
        cost: 0,
        optionalLabel: "",
      },
      certifiedCopyOfFormationDocument: {
        contentMd: "",
        cost: 0,
        optionalLabel: "",
      },
    };
    return accumulator;
  }, {} as FormationDisplayContentMap);

export type OnboardingStatus = "SUCCESS" | "ERROR";

export type FormationFields = keyof FormationFormData;
export type FormationFieldErrorMap = Record<FormationFields, FieldStatus>;
export type FormationErrorTypes = "generic" | "signer-checkbox" | "signer-name" | "signer-minimum";
export type FormationFieldErrors = { name: FormationFields; types: FormationErrorTypes[] };
export type FieldStatus = {
  invalid: boolean;
  types?: FormationErrorTypes[];
};

const profileFieldsFromConfig = merge(
  getMergedConfig().profileDefaults["STARTING"],
  getMergedConfig().profileDefaults["OWNING"]
);

export type ProfileFields = (keyof ProfileData & keyof typeof profileFieldsFromConfig) | keyof BusinessUser;

export type ProfileFieldErrorMap = Record<ProfileFields, FieldStatus>;

const allProfileFields = Object.keys(profileFieldsFromConfig) as ProfileFields[];

const businessUserDisplayFields = Object.keys(emptyBusinessUser) as (keyof BusinessUser)[];
const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];

export const profileFields: ProfileFields[] = [
  ...new Set([...allProfileFields, ...onboardingDataFields, ...businessUserDisplayFields]),
] as ProfileFields[];

export const createProfileFieldErrorMap = (): ProfileFieldErrorMap =>
  profileFields.reduce((p, c: ProfileFields) => {
    p[c] = { invalid: false };
    return p;
  }, {} as ProfileFieldErrorMap);

export type RoadmapDisplayContent = {
  contentMd: string;
  sidebarDisplayContent: Record<string, SidebarCardContent>;
};

export type DashboardDisplayContent = {
  introTextMd: string;
  opportunityTextMd: string;
};

export type Funding = {
  id: string;
  filename: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  contentMd: string;
  fundingType: FundingType;
  agency: OpportunityAgency[];
  publishStageArchive: FundingPublishStatus | null;
  openDate: string;
  dueDate: string;
  status: FundingStatus;
  programFrequency: FundingProgramFrequency;
  businessStage: FundingBusinessStage;
  employeesRequired: string;
  homeBased: FundingHomeBased;
  mwvb: string;
  preferenceForOpportunityZone: FundingpreferenceForOpportunityZone | null;
  county: County[];
  sector: string[];
};

export type Certification = {
  id: string;
  filename: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  contentMd: string;
  agency: OpportunityAgency[];
  applicableOwnershipTypes: string[];
  isSbe: boolean;
};

export type OpportunityAgency = "NJEDA" | "NJDOL";

export type FundingType =
  | "tax credit"
  | "loan"
  | "grant"
  | "technical assistance"
  | "hiring and employee training support"
  | "tax exemption";
export type FundingPublishStatus = "Do Not Publish";
export type FundingStatus =
  | "rolling application"
  | "deadline"
  | "first come, first serve"
  | "closed"
  | "opening soon";
export const FundingStatusOrder: Record<FundingStatus, number> = {
  "rolling application": 2,
  deadline: 0,
  "first come, first serve": 1,
  closed: 4,
  "opening soon": 4,
};
export type FundingProgramFrequency = "annual" | "ongoing" | "reoccuring" | "one-time" | "pilot" | "other";
export type FundingBusinessStage = "early-stage" | "operating" | "both";
export type FundingHomeBased = "yes" | "no" | "unknown";
export type FundingpreferenceForOpportunityZone = "yes" | "no";

export const AllCounties = [
  "All",
  "Atlantic",
  "Bergen",
  "Burlington",
  "Camden",
  "Cape May",
  "Cumberland",
  "Essex",
  "Gloucester",
  "Hudson",
  "Hunterdon",
  "Mercer",
  "Middlesex",
  "Monmouth",
  "Morris",
  "Ocean",
  "Passaic",
  "Salem",
  "Somerset",
  "Sussex",
  "Union",
  "Warren",
];

export type County =
  | "All"
  | "Atlantic"
  | "Bergen"
  | "Burlington"
  | "Camden"
  | "Cape May"
  | "Cumberland"
  | "Essex"
  | "Gloucester"
  | "Hudson"
  | "Hunterdon"
  | "Mercer"
  | "Middlesex"
  | "Monmouth"
  | "Morris"
  | "Ocean"
  | "Passaic"
  | "Salem"
  | "Somerset"
  | "Sussex"
  | "Union"
  | "Warren";

export type FormationDisplayContentMap = Record<FormationLegalType, FormationDisplayContent>;
export type TasksDisplayContent = {
  formationDisplayContent: FormationDisplayContentMap;
  cannabisPriorityStatusDisplayContent: CannabisPriorityStatusDisplayContent;
  cannabisApplyForLicenseDisplayContent: CannabisApplyForLicenseDisplayContent;
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
  required?: boolean;
  issuingAgency?: string;
  formName?: string;
}

export interface TaskLink {
  name: string;
  id: string;
  urlSlug: string;
  filename: string;
}

export type TaskDependencies = {
  name: string;
  dependencies: string[];
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

export type OperateReference = {
  name: string;
  urlSlug: string;
  urlPath: string;
};

export interface PostOnboarding {
  question: string;
  contentMd: string;
  radioYes: string;
  radioNo: string;
  radioNoContent: string;
}

export interface SessionHelper {
  getCurrentToken: () => Promise<string>;
  getCurrentUser: () => Promise<BusinessUser>;
}

export type NameAvailability = {
  status: "AVAILABLE" | "UNAVAILABLE";
  similarNames: string[];
};

export type SelfRegResponse = {
  authRedirectURL: string;
  userData: UserData;
};

export type SelfRegRequest = {
  name: string;
  email: string;
  confirmEmail: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
};

export type businessFormationTabsNames = "Name" | "Business" | "Contacts" | "Review" | "Billing";

export type SearchBusinessNameError = "BAD_INPUT" | "SEARCH_FAILED";

export type SidebarCardContent = {
  contentMd: string;
  id: string;
  header: string;
  imgPath: string;
  color: string;
  shadowColor: string;
  hasCloseButton: boolean;
  weight: number;
};

export type NaicsCodeObject = {
  SixDigitDescription?: string;
  SixDigitCode?: number;
  FourDigitDescription?: string;
  FourDigitCode?: number;
  TwoDigitDescription?: string;
  TwoDigitCode?: number[];
  industryIds?: string[];
};

export type LicenseSearchError = "NOT_FOUND" | "FIELDS_REQUIRED" | "SEARCH_FAILED";

export type FeedbackRequestDialogNames = "Select Feedback" | "Feature Request" | "Request Submitted";

export type ProfileTabs = "info" | "numbers" | "documents" | "notes";

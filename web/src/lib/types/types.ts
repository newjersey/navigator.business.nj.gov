import { getMergedConfig } from "@/contexts/configContext";
import {
  allFormationLegalTypes,
  BusinessUser,
  FormationFields,
  FormationLegalType,
  FormationMember,
  FormationSigner,
  IndustrySpecificData,
  PaymentType,
  Preferences,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { emptyBusinessUser } from "@businessnjgovnavigator/shared/businessUser";
import { BusinessPersona, emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { TaxFilingData } from "@businessnjgovnavigator/shared/taxFiling";
import { SectionType, TaskProgress } from "@businessnjgovnavigator/shared/userData";

// returns all keys in an object of a type
// e.g. KeysOfType<Task, boolean> will give all keys in the Task that have boolean types
export type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export type UserDataError = "NO_DATA" | "CACHED_ONLY" | "UPDATE_FAILED";

export type ProfileError =
  | "REQUIRED_ESSENTIAL_QUESTION"
  | "REQUIRED_LEGAL"
  | "REQUIRED_EXISTING_BUSINESS"
  | "REQUIRED_FOREIGN_BUSINESS_TYPE"
  | "REQUIRED_NEXUS_LOCATION_IN_NJ";

export type FlowType = Exclude<BusinessPersona, undefined>;

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

export const createEmptyTaskWithoutLinks = (): TaskWithoutLinks => {
  return {
    id: "",
    name: "",
    urlSlug: "",
    callToActionLink: "",
    callToActionText: "",
    contentMd: "",
    postOnboardingQuestion: "",
    required: undefined,
    issuingAgency: undefined,
    formName: undefined,
  };
};

export const createEmptyDbaDisplayContent = (): FormationDbaContent => {
  return {
    Authorize: createEmptyTaskWithoutLinks(),
    DbaResolution: createEmptyTaskWithoutLinks(),
    Formation: createEmptyTaskWithoutLinks(),
  };
};
export const createEmptyTaskDisplayContent = (): TasksDisplayContent => {
  return {
    formationDisplayContent: createEmptyFormationDisplayContent(),
    formationDbaContent: createEmptyDbaDisplayContent(),
  };
};

export type AllPaymentTypes = { type: PaymentType; displayText: string }[];

export const createEmptyFormationDisplayContent = (): FormationDisplayContentMap => {
  return allFormationLegalTypes.reduce((accumulator, curr) => {
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
};

export type OnboardingStatus = "SUCCESS" | "ERROR";

export type FormationStepNames = "Name" | "Business" | "Contacts" | "Billing" | "Review";
export type DbaStepNames = "Business Name" | "DBA Resolution" | "Authorize Business";

export type FormationFieldErrorState = {
  field: FormationFields;
  hasError: boolean;
  label: string;
};

export const profileFieldsFromConfig = getMergedConfig().profileDefaults.fields;

export type IndustrySpecificDataAddOnFields = "interstateLogistics" | "interstateMoving";

export type ProfileContentField = Exclude<
  (keyof ProfileData | keyof IndustrySpecificData | IndustrySpecificDataAddOnFields) &
    keyof typeof profileFieldsFromConfig,
  "businessPersona"
>;

export type ProfileFields = keyof ProfileData | keyof BusinessUser;

export type FieldStatus = { invalid: boolean };
export type ProfileFieldErrorMap = Record<ProfileFields, FieldStatus>;

const allProfileFields = Object.keys(profileFieldsFromConfig) as ProfileFields[];

const businessUserDisplayFields = Object.keys(emptyBusinessUser) as (keyof BusinessUser)[];
const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];

export const profileFields: ProfileFields[] = [
  ...new Set([...allProfileFields, ...onboardingDataFields, ...businessUserDisplayFields]),
] as ProfileFields[];

export const createProfileFieldErrorMap = (): ProfileFieldErrorMap => {
  return profileFields.reduce((p, c: ProfileFields) => {
    p[c] = { invalid: false };
    return p;
  }, {} as ProfileFieldErrorMap);
};

export type RoadmapDisplayContent = {
  contentMd: string;
  sidebarDisplayContent: Record<string, SidebarCardContent>;
};

export const defaultDisplayDateFormat = "MM/DD/YYYY";
export const defaultMarkdownDateFormat = "MM/DD/YYYY";

export type Funding = {
  id: string;
  filename: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  contentMd: string;
  descriptionMd: string;
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
  programPurpose: string;
  agencyContact: string;
};

export type Certification = {
  id: string;
  filename: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  contentMd: string;
  descriptionMd: string;
  agency: OpportunityAgency[];
  applicableOwnershipTypes: string[];
  isSbe: boolean;
};

export interface Opportunity {
  id: string;
  name: string;
  urlSlug: string;
  contentMd: string;
  descriptionMd: string;
  dueDate?: string;
  status?: string;
}

export type OpportunityAgency =
  | "NJEDA"
  | "NJDOL"
  | "NJDEP"
  | "NJDOT"
  | "NJ Department of Treasury"
  | "NJ Board of Public Utilities"
  | "New Jersey Business Action Center";

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

export interface FormationSignedAddress extends FormationMember, Partial<Omit<FormationSigner, "name">> {}

export type FormationDbaContent = {
  DbaResolution: TaskWithoutLinks;
  Authorize: TaskWithoutLinks;
  Formation: TaskWithoutLinks;
};
export type TasksDisplayContent = {
  formationDisplayContent: FormationDisplayContentMap;
  formationDbaContent: FormationDbaContent;
};

export interface Roadmap {
  steps: Step[];
  tasks: Task[];
}

export interface Step {
  stepNumber: number;
  name: string;
  timeEstimate: string;
  description: string;
  section: SectionType;
}

export interface Task {
  id: string;
  filename: string;
  stepNumber?: number;
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
  hidden?: true;
  requiresLocation?: boolean;
  industryId?: string;
}

export interface LicenseTask extends Task {
  licenseCertificationClassification: string;
  issuingDivision: string;
  divisionPhone: string;
  webflowId: string;
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

export const taxFilingMethod = [
  "online",
  "paper-or-by-mail-only",
  "online-required",
  "online-or-phone",
] as const;
export type TaxFilingMethod = (typeof taxFilingMethod)[number];

export type TaxAgency =
  | "New Jersey Division of Taxation"
  | "Internal Revenue Service (IRS)"
  | "NJ Department of Labor";

export interface Filing {
  id: string;
  filename: string;
  name: string;
  urlSlug: string;
  callToActionLink?: string;
  callToActionText?: string;
  contentMd: string;
  treasuryLink?: string;
  additionalInfo?: string;
  frequency?: string;
  extension?: boolean;
  taxRates?: string;
  filingMethod?: TaxFilingMethod;
  filingDetails?: string;
  agency?: TaxAgency;
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
  status: "AVAILABLE" | "DESIGNATOR" | "SPECIAL_CHARACTER" | "UNAVAILABLE";
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
  notStartedHeader: string;
  completedHeader: string;
  imgPath: string;
  ctaText: string;
  color: string;
  headerBackgroundColor: string;
  borderColor: string;
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

export type FeedbackRequestModalNames =
  | "Select Feedback"
  | "Feature Request"
  | "Request Submitted"
  | "Report Issue";

export type ProfileTabs = "info" | "numbers" | "documents" | "notes";

export interface UpdateQueue {
  queue: (userData: UserData) => UpdateQueue;
  queueTaskProgress: (taskProgress: Record<string, TaskProgress>) => UpdateQueue;
  queueUser: (user: Partial<BusinessUser>) => UpdateQueue;
  queueProfileData: (profileData: Partial<ProfileData>) => UpdateQueue;
  queuePreferences: (preferences: Partial<Preferences>) => UpdateQueue;
  queueTaxFilingData: (taxFilingData: Partial<TaxFilingData>) => UpdateQueue;
  update: () => Promise<void>;
  current: () => UserData;
}

export type MarkdownResult = {
  content: string;
  grayMatter: unknown;
};

export type TaskWithoutLinks = {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  postOnboardingQuestion: string;
  contentMd: string;
  required?: boolean;
  issuingAgency?: string;
  formName?: string;
};

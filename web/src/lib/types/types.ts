import { getMergedConfig } from "@/contexts/configContext";
import { ContextualInfo } from "@/contexts/contextualInfoContext";
import {
  Address,
  BusinessPersona,
  BusinessUser,
  emptyAddressData,
  emptyBusinessUser,
  emptyProfileData,
  FieldsForErrorHandling,
  FormationData,
  FormationFormData,
  FormationMember,
  FormationSigner,
  IndustrySpecificData,
  LicenseName,
  LicenseTaskId,
  Preferences,
  ProfileData,
  SectionType,
  TaskProgress,
  TaxFilingData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { Business } from "@businessnjgovnavigator/shared/userData";

// returns all keys in an object of a type
// e.g. KeysOfType<Task, boolean> will give all keys in the Task that have boolean types
export type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export type UserDataError = "NO_DATA" | "CACHED_ONLY" | "UPDATE_FAILED";

export type ProfileError =
  | "REQUIRED_ESSENTIAL_QUESTION"
  | "REQUIRED_EXISTING_BUSINESS"
  | "REQUIRED_FOREIGN_BUSINESS_TYPE"
  | "REQUIRED_REVIEW_INFO_BELOW";

export type OnboardingErrors = ProfileError | "ALERT_BAR";

export type FlowType = Exclude<BusinessPersona, undefined>;

export const createEmptyTaskWithoutLinks = (): TaskWithoutLinks => {
  return {
    id: "",
    name: "",
    urlSlug: "",
    callToActionLink: "",
    callToActionText: "",
    summaryDescriptionMd: "",
    contentMd: "",
    required: undefined,
    agencyId: undefined,
    agencyAdditionalContext: undefined,
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
    formationDbaContent: createEmptyDbaDisplayContent(),
  };
};

export type OnboardingStatus = "SUCCESS" | "ERROR";

export type FormationStepNames = "Name" | "Business" | "Contacts" | "Billing" | "Review";
export type DbaStepNames = "Business Name" | "DBA Resolution" | "Authorize Business";

export type FormationFieldErrorState = {
  field: FieldsForErrorHandling;
  hasError: boolean;
  label: string;
};

export const profileFieldsFromConfig = getMergedConfig().profileDefaults.fields;

export type ProfileContentField = Exclude<
  (keyof ProfileData | keyof IndustrySpecificData) & keyof typeof profileFieldsFromConfig,
  "businessPersona"
>;

export type ProfileFields = keyof ProfileData | keyof BusinessUser | keyof Address;

export type FieldErrorType = undefined | unknown;

export type FormContextFieldProps<K = FieldErrorType> = { errorTypes?: K[] };

export type FieldStatus<FieldError = FieldErrorType> = {
  invalid: boolean;
  updated?: boolean;
  errorTypes?: FieldError[];
};

export type ReducedFieldStates<K extends string | number | symbol, FieldError = FieldErrorType> = Record<
  K,
  FieldStatus<FieldError>
>;

export const createReducedFieldStates = <K extends string | number | symbol, FieldError = FieldErrorType>(
  fields: K[]
): ReducedFieldStates<K, FieldError> => {
  return fields.reduce((p, c: K) => {
    p[c] = { invalid: false };
    return p;
  }, {} as ReducedFieldStates<K, FieldError>);
};

const allProfileFields = Object.keys(profileFieldsFromConfig) as ProfileFields[];

const businessUserDisplayFields = Object.keys(emptyBusinessUser) as (keyof BusinessUser)[];
const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];
const formationAddressFields = Object.keys(emptyAddressData) as (keyof Address)[];

const profileFields: ProfileFields[] = [
  ...new Set([
    ...allProfileFields,
    ...onboardingDataFields,
    ...businessUserDisplayFields,
    ...formationAddressFields,
  ]),
] as ProfileFields[];

export const createProfileFieldErrorMap = <FieldError>(): ReducedFieldStates<ProfileFields, FieldError> =>
  createReducedFieldStates<(typeof profileFields)[number], FieldError>(profileFields);

export type ProfileFieldErrorMap = ReducedFieldStates<ProfileFields>;

export type RoadmapDisplayContent = {
  sidebarDisplayContent: Record<string, SidebarCardContent>;
};

export const defaultDisplayDateFormat = "MM/DD/YYYY";
export const defaultMarkdownDateFormat = "MM/DD/YYYY";

export type FundingCertifications =
  | "woman-owned"
  | "minority-owned"
  | "veteran-owned"
  | "disabled-veteran"
  | "small-business-enterprise"
  | "disadvantaged-business-enterprise"
  | "emerging-small-business-enterprise";

export type Funding = {
  id: string;
  filename: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  sidebarCardBodyText: string;
  summaryDescriptionMd: string;
  contentMd: string;
  fundingType: FundingType;
  agency: string[] | null | undefined;
  publishStageArchive: FundingPublishStatus | null;
  openDate: string;
  dueDate: string;
  status: FundingStatus;
  programFrequency: FundingProgramFrequency;
  businessStage: FundingBusinessStage;
  employeesRequired: string;
  homeBased: FundingHomeBased;
  certifications: FundingCertifications[] | null;
  preferenceForOpportunityZone: FundingpreferenceForOpportunityZone | null;
  county: County[];
  sector: string[];
  programPurpose: string | null | undefined;
  agencyContact: string | null | undefined;
  isNonprofitOnly: boolean | undefined | null;
};

export type Certification = {
  id: string;
  filename: string;
  name: string;
  urlSlug: string;
  summaryDescriptionMd: string;
  contentMd: string;
  sidebarCardBodyText: string;
  callToActionLink: string | undefined;
  callToActionText: string | undefined;
  agency: string[] | null | undefined;
  applicableOwnershipTypes: string[] | null | undefined;
  isSbe: boolean;
};

export interface Opportunity {
  id: string;
  name: string;
  urlSlug: string;
  contentMd: string;
  sidebarCardBodyText: string;
  dueDate?: string;
  status?: string;
}

interface AnytimeAction {
  name: string;
  icon: string;
  filename: string;
}

export interface AnytimeActionTask extends AnytimeAction {
  name: string;
  urlSlug: string;
  callToActionLink?: string;
  callToActionText?: string;
  issuingAgency?: string;
  icon: string;
  industryIds: string[];
  sectorIds: string[];
  applyToAllUsers: boolean;
  summaryDescriptionMd: string;
  contentMd: string;
  filename: string;
}

export interface AnytimeActionLink extends AnytimeAction {
  externalRoute: string;
  industryIds: string[];
  sectorIds: string[];
  applyToAllUsers: boolean;
}

export interface AnytimeActionLicenseReinstatement extends AnytimeAction {
  licenseName: LicenseName;
  urlSlug: string;
  contentMd: string;
  callToActionLink: string | undefined;
  callToActionText: string | undefined;
  issuingAgency: string;
  summaryDescriptionMd: string;
}

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

export interface FormationSignedAddress extends FormationMember, Partial<Omit<FormationSigner, "name">> {}

export type FormationDbaContent = {
  DbaResolution: TaskWithoutLinks;
  Authorize: TaskWithoutLinks;
  Formation: TaskWithoutLinks;
};
export type TasksDisplayContent = {
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
  displayname?: string;
  filename: string;
  stepNumber?: number;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  contentMd: string;
  summaryDescriptionMd: string;
  unlockedBy: TaskLink[];
  required?: boolean;
  agencyId?: string;
  agencyAdditionalContext?: string;
  formName?: string;
  hidden?: true;
  requiresLocation?: boolean;
  industryId?: string;
  stepLabel?: string;
}

export interface TaskWithLicenseTaskId extends Task {
  id: LicenseTaskId;
  licenseName?: LicenseName;
}

export interface WebflowLicense {
  id: string;
  webflowId: string;
  filename: string;
  urlSlug?: string;
  webflowName?: string;
  callToActionLink?: string;
  callToActionText?: string;
  agencyId?: string;
  agencyAdditionalContext?: string;
  divisionPhone?: string;
  licenseCertificationClassification?: string;
  webflowIndustry?: string;
  contentMd?: string;
  summaryDescriptionMd: string;
}

export interface TaskLink {
  name: string;
  id: string;
  urlSlug: string;
  filename: string;
}

export type TaskDependencies = {
  task?: string;
  licenseTask?: string;
  taskDependencies?: string[];
  licenseTaskDependencies?: string[];
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
  | "NJ Department of Labor"
  | "New Jersey Division of Revenue and Enterprise Services";

export interface Filing {
  id: string;
  filename: string;
  name: string;
  urlSlug: string;
  callToActionLink?: string;
  callToActionText?: string;
  contentMd: string;
  summaryDescriptionMd: string;
  treasuryLink?: string;
  additionalInfo?: string;
  frequency?: string;
  extension?: boolean;
  taxRates?: string;
  filingMethod?: TaxFilingMethod | null;
  filingDetails?: string;
  agency?: TaxAgency | null;
}

export interface LicenseEventType {
  issuingAgency: string;
  disclaimerText: string;
  renewalEventDisplayName: string;
  expirationEventDisplayName: string;
  filename: string;
  urlSlug: string;
  callToActionLink?: string;
  callToActionText?: string;
  contentMd: string;
  summaryDescriptionMd?: string;
  licenseName: LicenseName;
}

export type OperateReference = {
  name: string;
  urlSlug: string;
  urlPath: string;
};

export interface CallToActionHyperlink {
  text: string;
  destination: string;
  onClick: () => void;
}

export interface SessionHelper {
  getCurrentToken: () => Promise<string>;
  getCurrentUser: () => Promise<BusinessUser>;
}

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

export type SearchBusinessNameError = "BAD_INPUT" | "SEARCH_FAILED";

export type SidebarCardContent = {
  contentMd: string;
  id: string;
  header?: string;
  notStartedHeader?: string;
  completedHeader?: string;
  ctaText?: string;
  preBodySpanButtonText?: string;
  hasCloseButton: boolean;
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

export type ElevatorRegistrationSearchError = CommunityAffairsSearchError | "NO_ELEVATOR_REGISTRATIONS_FOUND";

export type HotelMotelRegistrationSearchError =
  | CommunityAffairsSearchError
  | "NO_HOTEL_MOTEL_REGISTRATIONS_FOUND";

export type MultipleDwellingSearchError =
  | CommunityAffairsSearchError
  | "NO_MULTIPLE_DWELLINGS_REGISTRATIONS_FOUND";

export type CommunityAffairsSearchError = "NO_PROPERTY_INTEREST_FOUND" | "FIELDS_REQUIRED" | "SEARCH_FAILED";

export type FeedbackRequestModalNames =
  | "Select Feedback"
  | "Feature Request"
  | "Request Submitted"
  | "Report Issue";

const _profileTabs = ["info", "numbers", "documents", "notes"] as const;

export type ProfileTabs = (typeof _profileTabs)[number];

export const profileTabs = _profileTabs as unknown as ProfileTabs[];

export interface UpdateQueue {
  queue: (userData: Partial<UserData>) => UpdateQueue;
  queueBusiness: (business: Business) => UpdateQueue;
  queueSwitchBusiness: (id: string) => UpdateQueue;
  queueTaskProgress: (taskProgress: Record<string, TaskProgress>) => UpdateQueue;
  queueUser: (user: Partial<BusinessUser>) => UpdateQueue;
  queueProfileData: (profileData: Partial<ProfileData>) => UpdateQueue;
  queuePreferences: (preferences: Partial<Preferences>) => UpdateQueue;
  queueTaxFilingData: (taxFilingData: Partial<TaxFilingData>) => UpdateQueue;
  queueFormationData: (formationData: Partial<FormationData>) => UpdateQueue;
  queueFormationFormData: (formatdionFormData: Partial<FormationFormData>) => UpdateQueue;
  queueTaskItemChecklist: (taskItemChecklist: Record<string, boolean>) => UpdateQueue;
  update: (config?: { local?: boolean }) => Promise<void>;
  current: () => UserData;
  currentBusiness: () => Business;
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
  summaryDescriptionMd: string;
  contentMd: string;
  required?: boolean;
  agencyId?: string;
  agencyAdditionalContext?: string;
  formName?: string;
};
export type Page = { current: number; previous: number };

export type StepperStep = { name: string; hasError?: boolean; isComplete?: boolean };

export interface ContextualInfoFile extends ContextualInfo {
  filename: string;
}

export interface ActionTile {
  imgPath: string;
  tileText: string;
  dataTestId: string;
  onClick: () => void;
  isPrimary?: boolean;
}

export type OutageAlertType = "ALL" | "UNREGISTERED_ONLY" | "LOGGED_IN_ONLY" | undefined;

export type OutageConfig = {
  FEATURE_ENABLE_OUTAGE_ALERT_BAR: boolean;
  OUTAGE_ALERT_MESSAGE: string;
  OUTAGE_ALERT_TYPE: OutageAlertType;
};

export interface NonEssentialQuestion {
  id: string;
  questionText: string;
  addOn: string;
}

export interface PageMetadata {
  filename: string;
  titlePostfix: string;
  siteDescription: string;
  homeTitle: string;
  dashboardTitle: string;
  profileTitle: string;
  deadLinksTitle: string;
  deadUrlsTitle: string;
  featureFlagsTitle: string;
}

export type FieldsForAddressErrorHandling = keyof Address;
export type AddressFields = keyof Address;
export type AddressTextField = keyof Address;

export type AddressFieldErrorState = {
  field: FieldsForAddressErrorHandling;
  hasError: boolean;
  label: string;
};

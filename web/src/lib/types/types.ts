import { getMergedConfig } from "@/contexts/configContext";
import { ContextualInfo } from "@/contexts/contextualInfoContext";
import {
  BusinessPersona,
  BusinessUser,
  FieldsForErrorHandling,
  FormationAddress,
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
  XrayData,
} from "@businessnjgovnavigator/shared/";
import { EmergencyTripPermitApplicationInfo } from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { EnvironmentData } from "@businessnjgovnavigator/shared/environment";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { Reducer } from "react";

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
export type EmergencyTripPermitStepNames =
  | "Instructions"
  | "Requestor"
  | "Trip"
  | "Billing"
  | "Review";

export type FormationFieldErrorState = {
  field: FieldsForErrorHandling;
  hasError: boolean;
  label: string;
};

export const profileFieldsFromConfig = getMergedConfig().profileDefaults.fields;

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
  minEmployeesRequired: number | undefined;
  maxEmployeesRequired: number | undefined;
  priority: boolean | undefined;
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
  filename: string;
  synonyms?: string[];
}

export interface AnytimeActionTask extends AnytimeAction {
  filename: string;
  name: string;
  category: AnytimeActionCategory[];
  urlSlug: string;
  callToActionLink?: string;
  callToActionText?: string;
  issuingAgency?: string;
  industryIds: string[];
  sectorIds: string[];
  applyToAllUsers: boolean;
  summaryDescriptionMd: string;
  contentMd: string;
  description?: string;
  searchMetaDataMatch?: string;
}

export interface AnytimeActionCategory {
  categoryId: string;
  categoryName: string;
}

export interface AnytimeActionCategoryMapping {
  [key: string]: string;
}

export interface AnytimeActionLicenseReinstatement extends AnytimeAction {
  licenseName: LicenseName;
  urlSlug: string;
  contentMd: string;
  callToActionLink: string | undefined;
  callToActionText: string | undefined;
  issuingAgency: string;
  summaryDescriptionMd: string;
  description?: string;
  searchMetaDataMatch?: string;
  category: AnytimeActionCategory[];
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
export type FundingProgramFrequency =
  | "annual"
  | "ongoing"
  | "reoccuring"
  | "one-time"
  | "pilot"
  | "other";
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

export interface FormationSignedAddress
  extends FormationMember,
    Partial<Omit<FormationSigner, "name">> {}

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

export interface XrayRenewalCalendarEventType {
  issuingAgency: string;
  eventDisplayName: string;
  filename: string;
  urlSlug: string;
  callToActionLink?: string;
  callToActionText?: string;
  contentMd: string;
  summaryDescriptionMd?: string;
  name: string;
  id: string;
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

export type ElevatorRegistrationSearchError =
  | CommunityAffairsSearchError
  | "NO_ELEVATOR_REGISTRATIONS_FOUND";

export type HotelMotelRegistrationSearchError =
  | CommunityAffairsSearchError
  | "NO_HOTEL_MOTEL_REGISTRATIONS_FOUND";

export type MultipleDwellingSearchError =
  | CommunityAffairsSearchError
  | "NO_MULTIPLE_DWELLINGS_REGISTRATIONS_FOUND";

export type CommunityAffairsSearchError =
  | "NO_PROPERTY_INTEREST_FOUND"
  | "FIELDS_REQUIRED"
  | "SEARCH_FAILED";

export type FeedbackRequestModalNames =
  | "Select Feedback"
  | "Feature Request"
  | "Request Submitted"
  | "Report Issue";

const _profileTabs = ["info", "permits", "numbers", "documents", "notes"] as const;

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
  queueEnvironmentData: (environmentData: Partial<EnvironmentData>) => UpdateQueue;
  queueXrayRegistrationData: (xrayRegistrationData: Partial<XrayData>) => UpdateQueue;
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

export type FieldsForAddressErrorHandling = keyof FormationAddress;
export type AddressFields = keyof FormationAddress;
export type AddressTextField = keyof FormationAddress;

export type AddressFieldErrorState = {
  field: FieldsForAddressErrorHandling;
  hasError: boolean;
  label: string;
};
export type FieldErrorType = undefined | unknown;

export type FieldsForEmergencyTripPermitErrorHandling = keyof EmergencyTripPermitApplicationInfo;
export type EmergencyTripPermitFieldErrorState = {
  field: FieldsForEmergencyTripPermitErrorHandling;
  hasError: boolean;
  label: string;
};

export enum FieldStateActionKind {
  RESET = "RESET",
  REGISTER = "REGISTER",
  UNREGISTER = "UNREGISTER",
  VALIDATION = "VALIDATION",
}

interface ValidationAction<T, FieldError = FieldErrorType> {
  type: FieldStateActionKind.VALIDATION;
  payload: { field: keyof T | (keyof T)[]; invalid: boolean; errorTypes?: FieldError[] };
}

interface RegisterAction<T> {
  type: FieldStateActionKind.REGISTER;
  payload: { field: keyof T };
}

interface UnRegisterAction<T> {
  type: FieldStateActionKind.UNREGISTER;
  payload: { field: keyof T };
}

interface ResetAction {
  type: FieldStateActionKind.RESET;
  payload?: undefined;
}

type FormContextReducerActions<T, FieldError = FieldErrorType> =
  | ResetAction
  | ValidationAction<T, FieldError>
  | RegisterAction<T>
  | UnRegisterAction<T>;
export type FieldStatus<FieldError = FieldErrorType> = {
  invalid: boolean;
  updated?: boolean;
  errorTypes?: FieldError[];
};
export type ReducedFieldStates<
  K extends string | number | symbol,
  FieldError = FieldErrorType,
> = Record<K, FieldStatus<FieldError>>;
export type FormContextReducer<T, FieldError = FieldErrorType> = Reducer<
  ReducedFieldStates<keyof T, FieldError>,
  FormContextReducerActions<T, FieldError>
>;

export interface FormContextType<T, FieldError = FieldErrorType> {
  fieldStates: ReducedFieldStates<keyof T, FieldError>;
  runValidations: boolean;
  reducer: React.Dispatch<
    FormContextReducerActions<ReducedFieldStates<keyof T, FieldError>, FieldError>
  >;
}

export type FormContextFieldProps<K = FieldErrorType> = { errorTypes?: K[] };

export type ProfileContentField = Exclude<
  (keyof ProfileData | keyof IndustrySpecificData) & keyof typeof profileFieldsFromConfig,
  "businessPersona"
>;

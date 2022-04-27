import {
  BusinessUser,
  emptyBusinessUser,
  emptyProfileData,
  FormationFormData,
  PaymentType,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";

// returns all keys in an object of a type
// e.g. KeysOfType<Task, boolean> will give all keys in the Task that have boolean types
export type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type UserDataError = "NO_DATA" | "CACHED_ONLY" | "UPDATE_FAILED";

export type ProfileError = "REQUIRED_LEGAL" | "REQUIRED_EXISTING_BUSINESS";

export type TextFieldContent = {
  contentMd: string;
  placeholder?: string;
  headingBolded?: string;
  headingNotBolded?: string;
};

export type RadioFieldContent = {
  contentMd: string;
  radioButtonYesText: string;
  radioButtonNoText: string;
};

export type CannabisRadioFieldContent = {
  contentMd: string;
  radioButtonAnnualText: string;
  radioButtonConditionalText: string;
};

export interface LegalFieldContent extends TextFieldContent {
  optionContent?: Record<string, string>;
}
export type FlowType = "OWNING" | "STARTING";

export type UserContentType = FlowType | "PROFILE";
export interface IndustryFieldContent extends TextFieldContent {
  specificHomeContractorMd: string;
  specificEmploymentAgencyMd: string;
  specificLiquorQuestion: RadioFieldContent;
  specificCannabisLicenseQuestion: CannabisRadioFieldContent;
  specificCpaQuestion: RadioFieldContent;
}

export type StartingFlowContent = {
  hasExistingBusiness: RadioFieldContent;
  businessName: TextFieldContent;
  industryId: IndustryFieldContent;
  municipality: TextFieldContent;
  legalStructure: LegalFieldContent;
  homeBased: RadioFieldContent;
};

export type ProfileContent = {
  businessName: TextFieldContent;
  industryId: IndustryFieldContent;
  municipality: TextFieldContent;
  legalStructure: LegalFieldContent;
  notes: TextFieldContent;
  documents: TextFieldContent;
  taxId: TextFieldContent;
  entityId: TextFieldContent;
  employerId: TextFieldContent;
  taxPin: TextFieldContent;
  ownership: TextFieldContent;
  existingEmployees: TextFieldContent;
  dateOfFormation: TextFieldContent;
  sectorId: TextFieldContent;
  homeBased: RadioFieldContent;
};

export type OwningFlowContent = {
  hasExistingBusiness: RadioFieldContent;
  businessName: TextFieldContent;
  dateOfFormation: TextFieldContent;
  entityId: TextFieldContent;
  ownership: TextFieldContent;
  legalStructure: LegalFieldContent;
  municipality: TextFieldContent;
  existingEmployees: TextFieldContent;
  sectorId: TextFieldContent;
  homeBased: RadioFieldContent;
};

export interface UserDisplayContent extends StartingFlowContent, OwningFlowContent, ProfileContent {}

export interface LoadDisplayContent
  extends Record<UserContentType, OwningFlowContent | StartingFlowContent | Partial<ProfileContent>> {
  OWNING: OwningFlowContent;
  STARTING: StartingFlowContent;
  PROFILE: Partial<ProfileContent>;
}

export type CannabisPriorityStatusDisplayContent = {
  cannabisSocialEquityBusiness: { contentMd: string };
  genericMinorityAndWomenOwned: { contentMd: string };
  genericVeteranOwned: { contentMd: string };
};

export type CannabisApplyForLicenseDisplayContent = {
  annualGeneralRequirements: { contentMd: string };
  conditionalGeneralRequirements: { contentMd: string };
  diverselyOwnedRequirements: { contentMd: string };
  impactZoneRequirements: { contentMd: string };
  microbusinessRequirements: { contentMd: string };
  socialEquityRequirements: { contentMd: string };
};

export type FormationDisplayContent = {
  introParagraph: { contentMd: string };
  businessNameCheck: { contentMd: string };
  agentNumberOrManual: {
    contentMd: string;
    radioButtonNumberText: string;
    radioButtonManualText: string;
  };
  members: TextFieldContent;
  signatureHeader: {
    contentMd: string;
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
  cannabisSocialEquityBusiness: {
    contentMd: "",
  },
  genericMinorityAndWomenOwned: {
    contentMd: "",
  },
  genericVeteranOwned: {
    contentMd: "",
  },
});

export const createEmptyCannabisApplyForLicenseDisplayContent =
  (): CannabisApplyForLicenseDisplayContent => ({
    annualGeneralRequirements: { contentMd: "" },
    conditionalGeneralRequirements: { contentMd: "" },
    diverselyOwnedRequirements: { contentMd: "" },
    impactZoneRequirements: { contentMd: "" },
    microbusinessRequirements: { contentMd: "" },
    socialEquityRequirements: { contentMd: "" },
  });

export const createEmptyFormationDisplayContent = (): FormationDisplayContent => ({
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
});

const coreContent = {
  businessName: {
    contentMd: "",
    placeholder: "",
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
      "s-corporation": "",
    },
  },
  municipality: {
    contentMd: "",
    placeholder: "",
  },
  homeBased: {
    contentMd: "",
    radioButtonYesText: "",
    radioButtonNoText: "",
  },
};

export const emptyStartingFlowContent: StartingFlowContent = {
  ...coreContent,
  hasExistingBusiness: {
    contentMd: "",
    radioButtonYesText: "",
    radioButtonNoText: "",
  },
  industryId: {
    contentMd: "",
    placeholder: "",
    specificHomeContractorMd: "",
    specificEmploymentAgencyMd: "",
    specificLiquorQuestion: {
      contentMd: "",
      radioButtonYesText: "",
      radioButtonNoText: "",
    },
    specificCannabisLicenseQuestion: {
      contentMd: "",
      radioButtonAnnualText: "",
      radioButtonConditionalText: "",
    },
    specificCpaQuestion: {
      contentMd: "",
      radioButtonYesText: "",
      radioButtonNoText: "",
    },
  },
};

export const emptyProfileContent: ProfileContent = {
  ...coreContent,
  notes: {
    contentMd: "",
  },
  documents: {
    contentMd: "",
    placeholder: "",
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
  taxPin: {
    contentMd: "",
  },
  businessName: {
    contentMd: "",
  },
  ownership: {
    contentMd: "",
  },
  existingEmployees: {
    contentMd: "",
  },
  dateOfFormation: {
    contentMd: "",
  },
  sectorId: {
    contentMd: "",
  },
  industryId: {
    contentMd: "",
    placeholder: "",
    specificHomeContractorMd: "",
    specificEmploymentAgencyMd: "",
    specificLiquorQuestion: {
      contentMd: "",
      radioButtonYesText: "",
      radioButtonNoText: "",
    },
    specificCannabisLicenseQuestion: {
      contentMd: "",
      radioButtonAnnualText: "",
      radioButtonConditionalText: "",
    },
    specificCpaQuestion: {
      contentMd: "",
      radioButtonYesText: "",
      radioButtonNoText: "",
    },
  },
};

export const emptyOwningFlowContent: OwningFlowContent = {
  businessName: coreContent.businessName,
  municipality: coreContent.municipality,
  homeBased: coreContent.homeBased,
  hasExistingBusiness: { contentMd: "", radioButtonYesText: "", radioButtonNoText: "" },
  entityId: {
    contentMd: "",
  },
  ownership: {
    contentMd: "",
    placeholder: "",
  },
  dateOfFormation: {
    contentMd: "",
    placeholder: "",
  },
  existingEmployees: {
    contentMd: "",
    placeholder: "",
  },
  sectorId: {
    contentMd: "",
    placeholder: "",
  },
  legalStructure: {
    contentMd: "",
    placeholder: "",
    optionContent: {
      "sole-proprietorship": "",
      "general-partnership": "",
      "limited-partnership": "",
      "limited-liability-partnership": "",
      "limited-liability-company": "",
      "c-corporation": "",
      "s-corporation": "",
    },
  },
};

export const createEmptyUserDisplayContent = (): UserDisplayContent => ({
  ...emptyOwningFlowContent,
  ...emptyStartingFlowContent,
  ...emptyProfileContent,
});

export const createEmptyLoadDisplayContent = (): LoadDisplayContent => ({
  STARTING: emptyStartingFlowContent,
  OWNING: emptyOwningFlowContent,
  PROFILE: emptyProfileContent,
});
export type ProfileFields = (keyof ProfileData & keyof UserDisplayContent) | keyof BusinessUser;

export const profileDisplayFields = Object.keys(emptyProfileContent) as (keyof ProfileContent)[];

export const owningFlowDisplayFields = Object.keys(emptyOwningFlowContent) as (keyof OwningFlowContent)[];

export const startFlowDisplayFields = Object.keys(emptyStartingFlowContent) as (keyof StartingFlowContent)[];

const businessUserDisplayFields = Object.keys(emptyBusinessUser) as (keyof BusinessUser)[];

const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];

export const profileFields: ProfileFields[] = [
  ...new Set([
    ...profileDisplayFields,
    ...onboardingDataFields,
    ...owningFlowDisplayFields,
    ...startFlowDisplayFields,
    ...businessUserDisplayFields,
  ]),
] as ProfileFields[];

export type OnboardingStatus = "SUCCESS" | "ERROR";

export type FormationFields = keyof FormationFormData;
export type FormationFieldErrorMap = Record<FormationFields, FieldStatus>;
export type FormationErrorTypes = "generic" | "signer-checkbox" | "signer-name";
export type FieldStatus = {
  invalid: boolean;
  types?: FormationErrorTypes[];
};

export type ProfileFieldErrorMap = Record<ProfileFields, FieldStatus>;

export const createProfileFieldErrorMap = (): ProfileFieldErrorMap =>
  profileFields.reduce((p, c: ProfileFields) => {
    p[c] = { invalid: false };
    return p;
  }, {} as ProfileFieldErrorMap);

export type RoadmapDisplayContent = {
  contentMd: string;
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
export type FundingStatus = "open" | "deadline" | "first-come, first-served" | "closed" | "opening soon";
export const FundingStatusOrder: Record<FundingStatus, number> = {
  open: 2,
  deadline: 0,
  "first-come, first-served": 1,
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

export type TasksDisplayContent = {
  formationDisplayContent: FormationDisplayContent;
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

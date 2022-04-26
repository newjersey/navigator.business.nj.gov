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
export type KeysOfType<T, V> = { readonly [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type UserDataError = "NO_DATA" | "CACHED_ONLY" | "UPDATE_FAILED";

export type ProfileError = "REQUIRED_LEGAL" | "REQUIRED_EXISTING_BUSINESS";

export type TextFieldContent = {
  readonly contentMd: string;
  readonly placeholder?: string;
  readonly headingBolded?: string;
  readonly headingNotBolded?: string;
};

export type RadioFieldContent = {
  readonly contentMd: string;
  readonly radioButtonYesText: string;
  readonly radioButtonNoText: string;
};

export type CannabisRadioFieldContent = {
  readonly contentMd: string;
  readonly radioButtonAnnualText: string;
  readonly radioButtonConditionalText: string;
};

export interface LegalFieldContent extends TextFieldContent {
  readonly optionContent?: Record<string, string>;
}
export type FlowType = "OWNING" | "STARTING";

export type UserContentType = FlowType | "PROFILE";
export interface IndustryFieldContent extends TextFieldContent {
  readonly specificHomeContractorMd: string;
  readonly specificEmploymentAgencyMd: string;
  readonly specificLiquorQuestion: RadioFieldContent;
  readonly specificCannabisLicenseQuestion: CannabisRadioFieldContent;
  readonly specificCpaQuestion: RadioFieldContent;
}

export type StartingFlowContent = {
  readonly hasExistingBusiness: RadioFieldContent;
  readonly businessName: TextFieldContent;
  readonly industryId: IndustryFieldContent;
  readonly municipality: TextFieldContent;
  readonly legalStructure: LegalFieldContent;
  readonly homeBased: RadioFieldContent;
};

export type ProfileContent = {
  readonly businessName: TextFieldContent;
  readonly industryId: IndustryFieldContent;
  readonly municipality: TextFieldContent;
  readonly legalStructure: LegalFieldContent;
  readonly notes: TextFieldContent;
  readonly documents: TextFieldContent;
  readonly taxId: TextFieldContent;
  readonly entityId: TextFieldContent;
  readonly employerId: TextFieldContent;
  readonly taxPin: TextFieldContent;
  readonly ownership: TextFieldContent;
  readonly existingEmployees: TextFieldContent;
  readonly dateOfFormation: TextFieldContent;
  readonly sectorId: TextFieldContent;
  readonly homeBased: RadioFieldContent;
};

export type OwningFlowContent = {
  readonly hasExistingBusiness: RadioFieldContent;
  readonly businessName: TextFieldContent;
  readonly dateOfFormation: TextFieldContent;
  readonly entityId: TextFieldContent;
  readonly ownership: TextFieldContent;
  readonly legalStructure: LegalFieldContent;
  readonly municipality: TextFieldContent;
  readonly existingEmployees: TextFieldContent;
  readonly sectorId: TextFieldContent;
  readonly homeBased: RadioFieldContent;
};

export interface UserDisplayContent extends StartingFlowContent, OwningFlowContent, ProfileContent {}

export interface LoadDisplayContent
  extends Record<UserContentType, OwningFlowContent | StartingFlowContent | Partial<ProfileContent>> {
  readonly OWNING: OwningFlowContent;
  readonly STARTING: StartingFlowContent;
  readonly PROFILE: Partial<ProfileContent>;
}

export type CannabisPriorityStatusDisplayContent = {
  readonly cannabisSocialEquityBusiness: { readonly contentMd: string };
  readonly genericMinorityAndWomenOwned: { readonly contentMd: string };
  readonly genericVeteranOwned: { readonly contentMd: string };
};

export type CannabisApplyForLicenseDisplayContent = {
  readonly annualGeneralRequirements: { readonly contentMd: string };
  readonly conditionalGeneralRequirements: { readonly contentMd: string };
  readonly diverselyOwnedRequirements: { readonly contentMd: string };
  readonly impactZoneRequirements: { readonly contentMd: string };
  readonly microbusinessRequirements: { readonly contentMd: string };
  readonly socialEquityRequirements: { readonly contentMd: string };
};

export type FormationDisplayContent = {
  readonly introParagraph: { readonly contentMd: string };
  readonly businessNameCheck: { readonly contentMd: string };
  readonly agentNumberOrManual: {
    readonly contentMd: string;
    readonly radioButtonNumberText: string;
    readonly radioButtonManualText: string;
  };
  readonly members: TextFieldContent;
  readonly signatureHeader: {
    readonly contentMd: string;
  };
  readonly services: {
    readonly contentMd: string;
  };
  readonly notification: {
    readonly contentMd: string;
  };
  readonly officialFormationDocument: {
    readonly contentMd: string;
    readonly cost: number;
  };
  readonly certificateOfStanding: {
    readonly contentMd: string;
    readonly cost: number;
    readonly optionalLabel: string;
  };
  readonly certifiedCopyOfFormationDocument: {
    readonly contentMd: string;
    readonly cost: number;
    readonly optionalLabel: string;
  };
};

export const createEmptyTaskDisplayContent = (): TasksDisplayContent => ({
  formationDisplayContent: createEmptyFormationDisplayContent(),
  cannabisPriorityStatusDisplayContent: createEmptyCannabisPriorityStatusDisplayContent(),
  cannabisApplyForLicenseDisplayContent: createEmptyCannabisApplyForLicenseDisplayContent(),
});

export type AllPaymentTypes = readonly { readonly type: PaymentType; readonly displayText: string }[];

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

export const profileDisplayFields = Object.keys(emptyProfileContent) as readonly (keyof ProfileContent)[];

export const owningFlowDisplayFields = Object.keys(
  emptyOwningFlowContent
) as readonly (keyof OwningFlowContent)[];

export const startFlowDisplayFields = Object.keys(
  emptyStartingFlowContent
) as readonly (keyof StartingFlowContent)[];

const businessUserDisplayFields = Object.keys(emptyBusinessUser) as readonly (keyof BusinessUser)[];

const onboardingDataFields = Object.keys(emptyProfileData) as readonly (keyof ProfileData)[];

export const profileFields: readonly ProfileFields[] = [
  ...new Set([
    ...profileDisplayFields,
    ...onboardingDataFields,
    ...owningFlowDisplayFields,
    ...startFlowDisplayFields,
    ...businessUserDisplayFields,
  ]),
] as readonly ProfileFields[];

export type OnboardingStatus = "SUCCESS" | "ERROR";

export type FormationFields = keyof FormationFormData;
export type FormationFieldErrorMap = Record<FormationFields, FieldStatus>;
export type FormationErrorTypes = "generic" | "signer-checkbox" | "signer-name";
export type FieldStatus = {
  readonly invalid: boolean;
  readonly types?: readonly FormationErrorTypes[];
};

export type ProfileFieldErrorMap = Record<ProfileFields, FieldStatus>;

export const createProfileFieldErrorMap = (): ProfileFieldErrorMap =>
  profileFields.reduce((p, c: ProfileFields) => {
    p[c] = { invalid: false };
    return p;
  }, {} as ProfileFieldErrorMap);

export type RoadmapDisplayContent = {
  readonly contentMd: string;
};

export type DashboardDisplayContent = {
  readonly introTextMd: string;
  readonly opportunityTextMd: string;
};

export type Funding = {
  readonly id: string;
  readonly filename: string;
  readonly name: string;
  readonly urlSlug: string;
  readonly callToActionLink: string;
  readonly callToActionText: string;
  readonly contentMd: string;
  readonly fundingType: FundingType;
  readonly agency: readonly OpportunityAgency[];
  readonly publishStageArchive: FundingPublishStatus | null;
  readonly openDate: string;
  readonly dueDate: string;
  readonly status: FundingStatus;
  readonly programFrequency: FundingProgramFrequency;
  readonly businessStage: FundingBusinessStage;
  readonly employeesRequired: string;
  readonly homeBased: FundingHomeBased;
  readonly mwvb: string;
  readonly preferenceForOpportunityZone: FundingpreferenceForOpportunityZone | null;
  readonly county: readonly County[];
  readonly sector: readonly string[];
};

export type Certification = {
  readonly id: string;
  readonly filename: string;
  readonly name: string;
  readonly urlSlug: string;
  readonly callToActionLink: string;
  readonly callToActionText: string;
  readonly contentMd: string;
  readonly agency: readonly OpportunityAgency[];
  readonly applicableOwnershipTypes: readonly string[];
  readonly isSbe: boolean;
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
  readonly formationDisplayContent: FormationDisplayContent;
  readonly cannabisPriorityStatusDisplayContent: CannabisPriorityStatusDisplayContent;
  readonly cannabisApplyForLicenseDisplayContent: CannabisApplyForLicenseDisplayContent;
};

export interface Roadmap {
  readonly steps: readonly Step[];
}

export interface RoadmapStatus {
  readonly sectionCompletion: SectionCompletion;
}

export type SectionCompletion = Record<SectionType, boolean>;

export const sectionNames = ["PLAN", "START", "OPERATE"] as const;
export type SectionType = typeof sectionNames[number];

export interface Step {
  readonly step_number: number;
  readonly name: string;
  readonly timeEstimate: string;
  readonly description: string;
  readonly tasks: readonly Task[];
  readonly section: SectionType;
}

export interface Task {
  readonly id: string;
  readonly filename: string;
  readonly name: string;
  readonly urlSlug: string;
  readonly callToActionLink: string;
  readonly callToActionText: string;
  readonly contentMd: string;
  readonly postOnboardingQuestion?: string;
  readonly unlockedBy: readonly TaskLink[];
  readonly required?: boolean;
  readonly issuingAgency?: string;
  readonly formName?: string;
}

export interface TaskLink {
  readonly name: string;
  readonly id: string;
  readonly urlSlug: string;
  readonly filename: string;
}

export type TaskDependencies = {
  readonly name: string;
  readonly dependencies: readonly string[];
};

export interface Filing {
  readonly id: string;
  readonly filename: string;
  readonly name: string;
  readonly urlSlug: string;
  readonly callToActionLink: string;
  readonly callToActionText: string;
  readonly contentMd: string;
}

export type OperateReference = {
  readonly name: string;
  readonly urlSlug: string;
  readonly urlPath: string;
};

export interface PostOnboarding {
  readonly question: string;
  readonly contentMd: string;
  readonly radioYes: string;
  readonly radioNo: string;
  readonly radioNoContent: string;
}

export interface SessionHelper {
  readonly getCurrentToken: () => Promise<string>;
  readonly getCurrentUser: () => Promise<BusinessUser>;
}

export type NameAvailability = {
  readonly status: "AVAILABLE" | "UNAVAILABLE";
  readonly similarNames: readonly string[];
};

export type SelfRegResponse = {
  readonly authRedirectURL: string;
  readonly userData: UserData;
};

export type SelfRegRequest = {
  readonly name: string;
  readonly email: string;
  readonly confirmEmail: string;
  readonly receiveNewsletter: boolean;
  readonly userTesting: boolean;
};

export type businessFormationTabsNames = "Name" | "Business" | "Contacts" | "Review" | "Billing";

export type SearchBusinessNameError = "BAD_INPUT" | "SEARCH_FAILED";

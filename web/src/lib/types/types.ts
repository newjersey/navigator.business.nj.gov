import {
  BusinessUser,
  emptyProfileData,
  FormationFormData,
  PaymentType,
  ProfileData,
} from "@businessnjgovnavigator/shared";

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type UserDataError = "NO_DATA" | "CACHED_ONLY" | "UPDATE_FAILED";

export interface Preferences {
  roadmapOpenSections: SectionType[];
  roadmapOpenSteps: number[];
}

export type ProfileError = "REQUIRED_LEGAL" | "REQUIRED_EXISTING_BUSINESS";

export type OperateDisplayContent = {
  entityIdMd: string;
  filingCalendarMd: string;
  entityIdErrorNotFoundMd: string;
  entityIdErrorNotRegisteredMd: string;
};

export type TextFieldContent = {
  contentMd: string;
  placeholder?: string;
  headingBolded?: string;
  headingNotBolded?: string;
};
export type RadioFieldContent = { contentMd: string; radioButtonYesText: string; radioButtonNoText: string };

export type LegalFieldContent = {
  contentMd: string;
  placeholder?: string;
  optionContent: Record<string, string>;
};
export type FlowType = "OWNING" | "STARTING";

export type UserContentType = FlowType | "PROFILE";
export interface IndustryFieldContent extends TextFieldContent {
  specificHomeContractorMd: string;
  specificEmploymentAgencyMd: string;
  specificLiquorQuestion: RadioFieldContent;
  specificHomeBasedBusinessQuestion: RadioFieldContent;
}

export type StartingFlowContent = {
  hasExistingBusiness: RadioFieldContent;
  businessName: TextFieldContent;
  industry: IndustryFieldContent;
  municipality: TextFieldContent;
  legalStructure: LegalFieldContent;
};

export type ProfileContent = {
  businessName: TextFieldContent;
  industry: IndustryFieldContent;
  municipality: TextFieldContent;
  legalStructure: LegalFieldContent;
  notes: TextFieldContent;
  taxId: TextFieldContent;
  entityId: TextFieldContent;
  employerId: TextFieldContent;
  taxPin: TextFieldContent;
  businessProfile: TextFieldContent;
  businessInformation: TextFieldContent;
  businessReferences: TextFieldContent;
  ownership: TextFieldContent;
  existingEmployees: TextFieldContent;
};

export type OwningFlowContent = {
  hasExistingBusiness: RadioFieldContent;
  businessName: TextFieldContent;
  industry: IndustryFieldContent;
  dateOfFormation: TextFieldContent;
  entityId: TextFieldContent;
  ownership: TextFieldContent;
  municipality: TextFieldContent;
  existingEmployees: TextFieldContent;
};

export interface UserDisplayContent extends StartingFlowContent, OwningFlowContent, ProfileContent {}

export interface LoadDisplayContent
  extends Record<UserContentType, OwningFlowContent | StartingFlowContent | Partial<ProfileContent>> {
  OWNING: OwningFlowContent;
  STARTING: StartingFlowContent;
  PROFILE: Partial<ProfileContent>;
}

export type FormationDisplayContent = {
  businessNameAndLegalStructure: {
    contentMd: string;
  };
  businessSuffix: TextFieldContent;
  businessStartDate: {
    contentMd: string;
  };
  businessAddressLine1: TextFieldContent;
  businessAddressLine2: TextFieldContent;
  businessAddressState: TextFieldContent;
  businessAddressZipCode: TextFieldContent;
  agentNumberOrManual: {
    contentMd: string;
    radioButtonNumberText: string;
    radioButtonManualText: string;
  };
  agentNumber: TextFieldContent;
  agentName: TextFieldContent;
  agentEmail: TextFieldContent;
  agentOfficeAddressLine1: TextFieldContent;
  agentOfficeAddressLine2: TextFieldContent;
  agentOfficeAddressCity: TextFieldContent;
  agentOfficeAddressState: TextFieldContent;
  agentOfficeAddressZipCode: TextFieldContent;
  memberName: TextFieldContent;
  memberAddressLine1: TextFieldContent;
  memberAddressLine2: TextFieldContent;
  memberAddressCity: TextFieldContent;
  memberAddressState: TextFieldContent;
  memberAddressZipCode: TextFieldContent;
  members: TextFieldContent;
  membersModal: {
    contentMd: string;
    sameNameCheckboxText: string;
  };
  signer: TextFieldContent;
  additionalSigners: TextFieldContent;
  paymentType: TextFieldContent;
  disclaimer: {
    contentMd: string;
  };
  notification: {
    contentMd: string;
  };
  optInAnnualReport: {
    contentMd: string;
  };
  optInCorpWatch: {
    contentMd: string;
  };
  officialFormationDocument: {
    contentMd: string;
    cost: string;
  };
  certificateOfStanding: {
    contentMd: string;
    cost: string;
    optionalLabel: string;
  };
  certifiedCopyOfFormationDocument: {
    contentMd: string;
    cost: string;
    optionalLabel: string;
  };
  contactFirstName: TextFieldContent;
  contactLastName: TextFieldContent;
  contactPhoneNumber: TextFieldContent;
  reviewPageBusinessName: {
    contentMd: string;
  };
  reviewPageLegalStructure: {
    contentMd: string;
  };
  reviewPageAddress: { contentMd: string };
  reviewPageBusinessStartDate: { contentMd: string };
  reviewPageBusinessSuffix: { contentMd: string };
  reviewPageEmail: { contentMd: string };
  reviewPageMemberName: { contentMd: string };
  reviewPageRegisteredAgentName: { contentMd: string };
  reviewPageSignerName: { contentMd: string };
  reviewPageLocation: { contentMd: string };
  reviewPageRegisteredAgent: { contentMd: string };
  reviewPageRegisteredAgentNumber: { contentMd: string };
  reviewPageSignatures: { contentMd: string };
  reviewPageMembers: { contentMd: string };
};

export const createEmptyTaskDisplayContent = (): TasksDisplayContent => ({
  formationDisplayContent: createEmptyFormationDisplayContent(),
});

export type AllPaymentTypes = { type: PaymentType; displayText: string }[];

export const createEmptyFormationDisplayContent = (): FormationDisplayContent => ({
  businessNameAndLegalStructure: {
    contentMd: "",
  },
  businessSuffix: {
    contentMd: "",
    placeholder: "",
  },
  businessStartDate: {
    contentMd: "",
  },
  businessAddressLine1: {
    contentMd: "",
    placeholder: "",
  },
  businessAddressLine2: {
    contentMd: "",
    placeholder: "",
  },
  businessAddressState: {
    contentMd: "",
    placeholder: "",
  },
  businessAddressZipCode: {
    contentMd: "",
    placeholder: "",
  },
  agentNumberOrManual: {
    contentMd: "",
    radioButtonNumberText: "",
    radioButtonManualText: "",
  },
  agentNumber: {
    contentMd: "",
    placeholder: "",
  },
  agentName: {
    contentMd: "",
    placeholder: "",
  },
  agentEmail: {
    contentMd: "",
    placeholder: "",
  },
  agentOfficeAddressLine1: {
    contentMd: "",
    placeholder: "",
  },
  agentOfficeAddressLine2: {
    contentMd: "",
    placeholder: "",
  },
  agentOfficeAddressCity: {
    contentMd: "",
    placeholder: "",
  },
  agentOfficeAddressState: {
    contentMd: "",
    placeholder: "",
  },
  agentOfficeAddressZipCode: {
    contentMd: "",
    placeholder: "",
  },
  memberName: {
    contentMd: "",
    placeholder: "",
  },
  memberAddressLine1: {
    contentMd: "",
    placeholder: "",
  },
  memberAddressLine2: {
    contentMd: "",
    placeholder: "",
  },
  memberAddressCity: {
    contentMd: "",
    placeholder: "",
  },
  memberAddressState: {
    contentMd: "",
    placeholder: "",
  },
  memberAddressZipCode: {
    contentMd: "",
    placeholder: "",
  },
  members: {
    contentMd: "",
    placeholder: "",
  },
  membersModal: {
    contentMd: "",
    sameNameCheckboxText: "",
  },
  signer: {
    contentMd: "",
    placeholder: "",
  },
  additionalSigners: {
    contentMd: "",
    placeholder: "",
  },
  paymentType: {
    contentMd: "",
    placeholder: "",
  },
  disclaimer: {
    contentMd: "",
  },
  notification: {
    contentMd: "",
  },
  optInAnnualReport: {
    contentMd: "",
  },
  optInCorpWatch: {
    contentMd: "",
  },
  officialFormationDocument: {
    contentMd: "",
    cost: "",
  },
  certificateOfStanding: {
    contentMd: "",
    cost: "",
    optionalLabel: "",
  },
  certifiedCopyOfFormationDocument: {
    contentMd: "",
    cost: "",
    optionalLabel: "",
  },
  contactFirstName: {
    contentMd: "",
    placeholder: "",
  },
  contactLastName: {
    contentMd: "",
    placeholder: "",
  },
  contactPhoneNumber: {
    contentMd: "",
    placeholder: "",
  },
  reviewPageBusinessName: {
    contentMd: "",
  },
  reviewPageLegalStructure: {
    contentMd: "",
  },
  reviewPageAddress: { contentMd: "" },
  reviewPageBusinessStartDate: { contentMd: "" },
  reviewPageBusinessSuffix: { contentMd: "" },
  reviewPageEmail: { contentMd: "" },
  reviewPageMemberName: { contentMd: "" },
  reviewPageRegisteredAgentName: { contentMd: "" },
  reviewPageSignerName: { contentMd: "" },
  reviewPageLocation: { contentMd: "" },
  reviewPageRegisteredAgent: { contentMd: "" },
  reviewPageRegisteredAgentNumber: { contentMd: "" },
  reviewPageSignatures: { contentMd: "" },
  reviewPageMembers: { contentMd: "" },
});

const coreContent = {
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
      "s-corporation": "",
    },
  },
  municipality: {
    contentMd: "",
    placeholder: "",
  },
};
export const emptyStartingFlowContent: StartingFlowContent = {
  ...coreContent,
  hasExistingBusiness: { contentMd: "", radioButtonYesText: "", radioButtonNoText: "" },
};

export const emptyProfileContent: ProfileContent = {
  ...coreContent,
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
  taxPin: {
    contentMd: "",
  },
  businessProfile: {
    contentMd: "",
  },
  businessInformation: {
    contentMd: "",
  },
  businessReferences: {
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
};

export const emptyOwningFlowContent: OwningFlowContent = {
  businessName: coreContent.businessName,
  industry: coreContent.industry,
  municipality: coreContent.municipality,
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
export type ProfileFields = keyof ProfileData & keyof UserDisplayContent;

export const profileDisplayFields = Object.keys(emptyProfileContent) as (keyof ProfileContent)[];

export const owningFlowDisplayFields = Object.keys(emptyOwningFlowContent) as (keyof OwningFlowContent)[];

export const startFlowDisplayFields = Object.keys(emptyStartingFlowContent) as (keyof StartingFlowContent)[];

const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];

export const profileFields: ProfileFields[] = [
  ...new Set([
    ...profileDisplayFields,
    ...onboardingDataFields,
    ...owningFlowDisplayFields,
    ...startFlowDisplayFields,
  ]),
] as ProfileFields[];

export type OnboardingStatus = "SUCCESS" | "ERROR";

export type FormationFields = keyof FormationFormData;
export type FormationFieldErrorMap = Record<FormationFields, FieldStatus>;

export type FieldStatus = {
  invalid: boolean;
};

export type ProfileFieldErrorMap = Record<ProfileFields, FieldStatus>;

export const createProfileFieldErrorMap = (): ProfileFieldErrorMap =>
  profileFields.reduce((p, c: ProfileFields) => {
    p[c] = { invalid: false };
    return p;
  }, {} as ProfileFieldErrorMap);

export type RoadmapDisplayContent = {
  contentMd: string;
  operateDisplayContent: OperateDisplayContent;
};

export type DashboardDisplayContent = {
  introTextMd: string;
  opportunityTextMd: string;
};

export type Opportunity = {
  id: string;
  filename: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  contentMd: string;
  type: OpportunityType;
};

export type OpportunityType = "FUNDING" | "CERTIFICATION";

export type TasksDisplayContent = {
  formationDisplayContent: FormationDisplayContent;
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

export interface AuthenticationHelper {
  onSignIn: () => Promise<void>;
  onSignOut: () => void;
}

export type NameAvailability = {
  status: "AVAILABLE" | "UNAVAILABLE";
  similarNames: string[];
};

export type SelfRegResponse = {
  authRedirectURL: string;
};

export type SelfRegRequest = {
  name: string;
  email: string;
  confirmEmail: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
};

export type businessFormationTabsNames = "Main Business" | "Contacts" | "Review" | "Payment";

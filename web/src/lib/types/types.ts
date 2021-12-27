import { BusinessUser, emptyProfileData, PaymentType, ProfileData } from "@businessnjgovnavigator/shared";

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

type TextFieldContent = {
  contentMd: string;
  placeholder: string;
};

export type ProfileDisplayContent = {
  hasExistingBusiness: { contentMd: string; radioButtonYesText: string; radioButtonNoText: string };
  businessName: TextFieldContent;
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
  certifications: { contentMd: string; placeholder: string };
  existingEmployees: {
    contentMd: string;
    placeholder: string;
  };
};

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
});

const emptyProfileDisplayContent: ProfileDisplayContent = {
  hasExistingBusiness: { contentMd: "", radioButtonYesText: "", radioButtonNoText: "" },
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
  certifications: {
    contentMd: "",
    placeholder: "",
  },
  existingEmployees: {
    contentMd: "",
    placeholder: "",
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

export const profileFields: ProfileFields[] = [
  ...new Set([...profileDisplayContentFields, ...onboardingDataFields]),
] as ProfileFields[];

export type OnboardingStatus = "SUCCESS" | "ERROR";

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

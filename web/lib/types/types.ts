export interface UserData {
  user: BusinessUser;
  onboardingData: OnboardingData;
  formProgress: FormProgress;
  taskProgress: Record<string, TaskProgress>;
}

export type FormProgress = "UNSTARTED" | "COMPLETED";
export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export const createEmptyUserData = (user: BusinessUser): UserData => {
  return {
    user: user,
    onboardingData: createEmptyOnboardingData(),
    formProgress: "UNSTARTED",
    taskProgress: {},
  };
};

export const createEmptyOnboardingData = (): OnboardingData => {
  return {
    businessName: "",
    industry: "generic",
    legalStructure: undefined,
    municipality: undefined,
  };
};

export interface OnboardingData {
  businessName: string;
  industry: Industry;
  legalStructure: LegalStructure | undefined;
  municipality: Municipality | undefined;
}

export type OnboardingDisplayContent = {
  businessName: FieldDisplayContent;
  industry: FieldDisplayContent;
  legalStructure: FieldDisplayContent;
  municipality: FieldDisplayContent;
};

export type FieldDisplayContent = {
  title: string;
  description: string;
  placeholder?: string;
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

export const createEmptyOnboardingDisplayContent = (): OnboardingDisplayContent => {
  return {
    businessName: {
      title: "",
      description: "",
    },
    industry: {
      title: "",
      description: "",
    },
    legalStructure: {
      title: "",
      description: "",
    },
    municipality: {
      title: "",
      description: "",
    },
  };
};

export interface Roadmap {
  type: Industry;
  steps: Step[];
}

export interface RoadmapBuilder {
  steps: StepBuilder[];
}

export interface StepBuilder {
  step_number: number;
  id: string;
  name: string;
  timeEstimate: string;
  description: string;
  tasks: TaskBuilder[];
}

export interface TaskBuilder {
  id: string;
  weight: number;
}

export interface GenericStep {
  step_number: number;
  id: string;
  name: string;
  timeEstimate: string;
  description: string;
}

export interface AddOn {
  step: string;
  weight: number;
  task: string;
}

export interface TaskModification {
  step: string;
  taskToReplace: string;
  replaceWith: string;
}

export interface Step {
  step_number: number;
  id: string;
  name: string;
  timeEstimate: string;
  description: string;
  tasks: Task[];
}

export interface TaskOverview {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  name: string;
  destinationText: string;
  callToActionLink: string;
  callToActionText: string;
  contentHtml: string;
}

export type Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";

export const ALL_INDUSTRIES: Industry[] = [
  "restaurant",
  "e-commerce",
  "home-contractor",
  "cosmetology",
  "generic",
];

export type LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation"
  | "s-corporation"
  | "b-corporation";

export const ALL_LEGAL_STRUCTURES: LegalStructure[] = [
  "sole-proprietorship",
  "general-partnership",
  "limited-partnership",
  "limited-liability-partnership",
  "limited-liability-company",
  "c-corporation",
  "s-corporation",
  "b-corporation",
];

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

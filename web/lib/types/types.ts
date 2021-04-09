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
  };
};

export interface OnboardingData {
  businessName: string;
  industry: Industry;
  legalStructure: LegalStructure | undefined;
}

export type OnboardingDisplayContent = {
  businessName: FieldDisplayContent;
  industry: FieldDisplayContent;
  legalStructure: FieldDisplayContent;
};

export type FieldDisplayContent = {
  title: string;
  description: string;
  placeholder?: string;
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

export type TaskModificationType = "description_replace";

export interface TaskModification {
  step: string;
  task: string;
  type: TaskModificationType;
  content: string;
}

export interface Step {
  step_number: number;
  id: string;
  name: string;
  timeEstimate: string;
  description: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  description: string;
  destination: Destination;
  to_complete_must_have: string[];
  after_completing_will_have: string[];
}

export interface Destination {
  name: string;
  link: string;
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

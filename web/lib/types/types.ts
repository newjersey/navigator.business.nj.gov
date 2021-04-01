import { BusinessForm, Cosmetology, ECommerce, HomeImprovementContractor, Restaurant } from "./form";

export interface UserData {
  user: BusinessUser;
  formData: BusinessForm;
  formProgress: FormProgress;
  taskProgress: Record<string, TaskProgress>;
}

export type FormProgress = "UNSTARTED" | "COMPLETED";

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export const createEmptyUserData = (user: BusinessUser): UserData => {
  return {
    user: user,
    formData: {
      user: {
        email: user.email,
      },
    },
    formProgress: "UNSTARTED",
    taskProgress: {},
  };
};

export type BusinessType = Restaurant | ECommerce | HomeImprovementContractor | Cosmetology | "generic";

export interface Roadmap {
  type: BusinessType;
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

export type LegalStructure =
  | "Sole Proprietorship"
  | "General Partnership"
  | "Limited Partnership (LP)"
  | "Limited Liability Partnership (LLP)"
  | "Limited Liability Company (LLC)"
  | "C-Corporation"
  | "S-Corporation"
  | "B-Corporation";

export const ALL_LEGAL_STRUCTURES: LegalStructure[] = [
  "Sole Proprietorship",
  "General Partnership",
  "Limited Partnership (LP)",
  "Limited Liability Partnership (LLP)",
  "Limited Liability Company (LLC)",
  "C-Corporation",
  "S-Corporation",
  "B-Corporation",
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

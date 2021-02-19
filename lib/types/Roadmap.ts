import { StepId } from "./StepId";

export interface Roadmap {
  steps: StepsEntity[];
}
export interface StepsEntity {
  step_number: number;
  id: StepId;
  name: string;
  description: string;
  tasks: TasksEntity[];
}
export interface TasksEntity {
  task_number: number;
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

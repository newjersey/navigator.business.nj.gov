export interface RoadmapFromFile {
  steps: StepsFromFile[];
}
export interface StepsFromFile {
  step_number: number;
  id: string;
  name: string;
  timeEstimate: string;
  description: string;
  tasks: string[];
}

export interface Roadmap {
  steps: StepsEntity[];
}

export interface StepsEntity {
  step_number: number;
  id: string;
  name: string;
  timeEstimate: string;
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

export type TasksLookup = Record<string, TasksEntity>;

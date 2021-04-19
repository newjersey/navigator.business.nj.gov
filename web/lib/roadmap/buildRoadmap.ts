import {
  AddOn,
  GenericStep,
  LegalStructure,
  OnboardingData,
  Roadmap,
  RoadmapBuilder,
  Task,
  TaskBuilder,
  TaskModification,
} from "../types/types";
import genericTaskAddOns from "../../roadmaps/generic/generic-tasks.json";
import steps from "../../roadmaps/steps.json";
import { convertTaskMdToTask } from "../utils/convertTaskMdToTask";

const importAddOns = async (relativePath: string): Promise<AddOn[]> => {
  return (await import(`../../roadmaps/${relativePath}.json`)).default as AddOn[];
};

const importModification = async (relativePath: string): Promise<TaskModification[]> => {
  return (await import(`../../roadmaps/modifications/${relativePath}.json`)).default as TaskModification[];
};

const orderByWeight = (taskA: TaskBuilder, taskB: TaskBuilder): number => {
  return taskA.weight > taskB.weight ? 1 : -1;
};

const TradeNameGroup: LegalStructure[] = ["general-partnership", "sole-proprietorship"];

const PublicRecordFilingGroup: LegalStructure[] = [
  "limited-partnership",
  "limited-liability-partnership",
  "limited-liability-company",
  "c-corporation",
  "s-corporation",
  "b-corporation",
];

export const buildRoadmap = async (onboardingData: OnboardingData): Promise<Roadmap> => {
  let roadmapBuilder: RoadmapBuilder = {
    steps: steps.map((step: GenericStep) => ({
      ...step,
      tasks: [],
    })),
  };

  roadmapBuilder = addTasksFromAddOn(roadmapBuilder, genericTaskAddOns);

  if (onboardingData.industry === "restaurant") {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/restaurant"));
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/physical-location"));
  }

  if (onboardingData.industry === "home-contractor") {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/home-contractor"));
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/physical-location"));
    roadmapBuilder = modifyTasks(roadmapBuilder, await importModification("home-contractor"));
  }

  if (onboardingData.industry === "cosmetology") {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/cosmetology"));
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/physical-location"));
    roadmapBuilder = modifyTasks(roadmapBuilder, await importModification("cosmetology"));
  }

  if (onboardingData.legalStructure) {
    if (PublicRecordFilingGroup.includes(onboardingData.legalStructure)) {
      roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/public-record-filing"));
    }

    if (TradeNameGroup.includes(onboardingData.legalStructure)) {
      roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/trade-name"));
    }
  }

  if (step5hasNoTasks(roadmapBuilder)) {
    removeStep5(roadmapBuilder);
  }

  return {
    ...roadmapBuilder,
    type: onboardingData.industry,
    steps: await Promise.all(
      roadmapBuilder.steps.map(async (step) => ({
        ...step,
        tasks: await Promise.all(step.tasks.sort(orderByWeight).map((task) => getTaskById(task.id))),
      }))
    ),
  };
};

const step5hasNoTasks = (roadmap: RoadmapBuilder): boolean => {
  const step5 = roadmap.steps.find((step) => step.id === "inspection-requirements");
  if (!step5) {
    return false;
  }
  return step5.tasks.length === 0;
};

const removeStep5 = (roadmapBuilder: RoadmapBuilder): RoadmapBuilder => {
  roadmapBuilder.steps = roadmapBuilder.steps.filter((step) => step.id !== "inspection-requirements");
  return roadmapBuilder;
};

const addTasksFromAddOn = (roadmap: RoadmapBuilder, addOns: AddOn[]): RoadmapBuilder => {
  addOns.forEach((addOn) => {
    const step = roadmap.steps.find((step) => step.id === addOn.step);
    if (!step) {
      return;
    }

    step.tasks = [...step.tasks, { id: addOn.task, weight: addOn.weight }];
  });

  return roadmap;
};

const modifyTasks = (roadmap: RoadmapBuilder, modifications: TaskModification[]): RoadmapBuilder => {
  modifications.forEach((modification) => {
    const step = roadmap.steps.find((step) => step.id === modification.step);
    if (!step) {
      return;
    }

    const task = step.tasks.find((task) => task.id === modification.taskToReplace);
    if (!task) {
      return;
    }
    task.id = modification.replaceWith;
  });

  return roadmap;
};

const getTaskById = async (id: string): Promise<Task> => {
  const file = await import(`../../roadmaps/tasks/${id}.md`);
  return convertTaskMdToTask(file.default);
};

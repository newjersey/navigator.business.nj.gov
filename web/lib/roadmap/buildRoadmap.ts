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

const importAddOns = async (relativePath: string): Promise<AddOn[]> => {
  return (await import(`../../roadmaps/${relativePath}.json`)).default as AddOn[];
};

const importModification = async (relativePath: string): Promise<TaskModification[]> => {
  return (await import(`../../roadmaps/modifications/${relativePath}.json`)).default as TaskModification[];
};

const orderByWeight = (taskA: TaskBuilder, taskB: TaskBuilder): number => {
  return taskA.weight > taskB.weight ? 1 : -1;
};

const TradeNameGroup: LegalStructure[] = ["General Partnership", "Sole Proprietorship"];

const PublicRecordFilingGroup: LegalStructure[] = [
  "Limited Partnership (LP)",
  "Limited Liability Partnership (LLP)",
  "Limited Liability Company (LLC)",
  "C-Corporation",
  "S-Corporation",
  "B-Corporation",
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
  }

  if (onboardingData.industry === "cosmetology") {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/cosmetology"));
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/physical-location"));
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
    roadmapBuilder.steps = roadmapBuilder.steps.filter((step) => step.id !== "inspection-requirements");
  }

  let roadmap: Roadmap = {
    ...roadmapBuilder,
    type: onboardingData.industry,
    steps: await Promise.all(
      roadmapBuilder.steps.map(async (step) => ({
        ...step,
        tasks: await Promise.all(step.tasks.sort(orderByWeight).map((task) => getTaskByIdAsync(task.id))),
      }))
    ),
  };

  if (onboardingData.industry === "home-contractor") {
    roadmap = modifyTasks(roadmap, await importModification("home-contractor"));
  }

  if (onboardingData.industry === "cosmetology") {
    roadmap = modifyTasks(roadmap, await importModification("cosmetology"));
  }

  return roadmap;
};

const step5hasNoTasks = (roadmap: RoadmapBuilder): boolean => {
  const step5 = roadmap.steps.find((step) => step.id === "inspection-requirements");
  if (!step5) {
    return false;
  }
  return step5.tasks.length === 0;
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

const modifyTasks = (roadmap: Roadmap, modifications: TaskModification[]): Roadmap => {
  modifications.forEach((modification) => {
    const step = roadmap.steps.find((step) => step.id === modification.step);
    if (!step) {
      return;
    }

    const task = step.tasks.find((task) => task.id === modification.task);
    if (!task) {
      return;
    }

    if (modification.type === "description_replace") {
      task.description = modification.content;
    }
  });

  return roadmap;
};

const getTaskByIdAsync = async (id: string): Promise<Task> => {
  return (await import(`../../roadmaps/tasks/${id}.json`)).default as Task;
};

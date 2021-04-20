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
import * as api from "../api-client/apiClient";

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

  if (onboardingData.municipality) {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/municipality"));
  }

  if (step5hasNoTasks(roadmapBuilder)) {
    removeStep5(roadmapBuilder);
  }

  let roadmap = {
    ...roadmapBuilder,
    type: onboardingData.industry,
    steps: await Promise.all(
      roadmapBuilder.steps.map(async (step) => ({
        ...step,
        tasks: await Promise.all(step.tasks.sort(orderByWeight).map((task) => getTaskById(task.id))),
      }))
    ),
  };

  if (onboardingData.municipality) {
    roadmap = await addMunicipalitySpecificData(roadmap, onboardingData.municipality.id);
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

const removeStep5 = (roadmapBuilder: RoadmapBuilder): RoadmapBuilder => {
  roadmapBuilder.steps = roadmapBuilder.steps.filter((step) => step.id !== "inspection-requirements");
  return roadmapBuilder;
};

const addMunicipalitySpecificData = async (roadmap: Roadmap, municipalityId: string): Promise<Roadmap> => {
  const step = roadmap.steps.find((step) => step.id === "lease-and-permits");
  if (!step) {
    return roadmap;
  }
  const task = step.tasks.find((task) => task.id === "check-local-requirements");
  if (!task) {
    return roadmap;
  }

  const municipality = await api.getMunicipality(municipalityId);
  task.destinationText = municipality.townDisplayName;
  task.callToActionLink = municipality.townWebsite;
  task.callToActionText = `Visit the website for ${municipality.townName}`;
  return roadmap;
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
    const task = findTaskInRoadmapById(roadmap, modification.step, modification.taskToReplace);
    if (!task) {
      return;
    }
    task.id = modification.replaceWith;
  });

  return roadmap;
};

const findTaskInRoadmapById = (
  roadmapBuilder: RoadmapBuilder,
  stepId: string,
  taskId: string
): TaskBuilder | undefined => {
  const step = roadmapBuilder.steps.find((step) => step.id === stepId);
  if (!step) {
    return;
  }

  return step.tasks.find((task) => task.id === taskId);
};

const getTaskById = async (id: string): Promise<Task> => {
  const file = await import(`../../roadmaps/tasks/${id}.md`);
  return convertTaskMdToTask(file.default);
};

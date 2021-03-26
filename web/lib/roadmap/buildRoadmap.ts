import { BusinessForm } from "../types/form";
import {
  BusinessType,
  GenericStep,
  LegalStructure,
  Roadmap,
  RoadmapBuilder,
  Task,
  TaskBuilder,
  TaskModification,
  TaskStepLink,
} from "../types/types";
import genericTaskLinks from "../../roadmaps/generic/generic-tasks.json";
import genericRoadmap from "../../roadmaps/generic/generic.json";

const importTaskStepLinks = async (relativePath: string): Promise<TaskStepLink[]> => {
  return (await import(`../../roadmaps/${relativePath}.json`)).default as TaskStepLink[];
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

export const buildRoadmap = async (formData: BusinessForm): Promise<Roadmap> => {
  let roadmapBuilder: RoadmapBuilder = {
    ...genericRoadmap,
    steps: genericRoadmap.steps.map((step: GenericStep) => ({
      ...step,
      tasks: [],
    })),
  };

  roadmapBuilder = addTasksFromLink(roadmapBuilder, genericTaskLinks);

  if (formData.businessType?.businessType === "restaurant") {
    roadmapBuilder = addTasksFromLink(roadmapBuilder, await importTaskStepLinks("industry/restaurant"));
    roadmapBuilder = addTasksFromLink(roadmapBuilder, await importTaskStepLinks("add-ons/physical-location"));
    if (needsLiquorLicense(formData)) {
      roadmapBuilder = addTasksFromLink(roadmapBuilder, await importTaskStepLinks("add-ons/liquor-license"));
    }
  }

  if (formData.businessType?.businessType === "home-contractor") {
    roadmapBuilder = addTasksFromLink(roadmapBuilder, await importTaskStepLinks("industry/home-contractor"));
    roadmapBuilder = addTasksFromLink(roadmapBuilder, await importTaskStepLinks("add-ons/physical-location"));
  }

  if (formData.businessStructure?.businessStructure) {
    if (PublicRecordFilingGroup.includes(formData.businessStructure?.businessStructure)) {
      roadmapBuilder = addTasksFromLink(
        roadmapBuilder,
        await importTaskStepLinks("legal-structure/public-record-filing")
      );
    }

    if (TradeNameGroup.includes(formData.businessStructure?.businessStructure)) {
      roadmapBuilder = addTasksFromLink(
        roadmapBuilder,
        await importTaskStepLinks("legal-structure/trade-name")
      );
    }
  }

  let roadmap: Roadmap = {
    ...roadmapBuilder,
    type: formData.businessType?.businessType || ("generic" as BusinessType),
    steps: await Promise.all(
      roadmapBuilder.steps.map(async (step) => ({
        ...step,
        tasks: await Promise.all(step.tasks.sort(orderByWeight).map((task) => getTaskByIdAsync(task.id))),
      }))
    ),
  };

  if (formData.businessType?.businessType === "home-contractor") {
    roadmap = modifyTasks(roadmap, await importModification("industry/home-contractor"));
  }

  return roadmap;
};

const addTasksFromLink = (roadmap: RoadmapBuilder, taskLinks: TaskStepLink[]): RoadmapBuilder => {
  taskLinks.forEach((taskLink) => {
    const step = roadmap.steps.find((step) => step.id === taskLink.step);
    if (!step) {
      return;
    }

    step.tasks = [...step.tasks, { id: taskLink.task, weight: taskLink.weight }];
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

const needsLiquorLicense = (formData: BusinessForm): boolean => {
  if (!formData.locations?.locations) {
    return false;
  }

  return formData.locations.locations.some((it) => it.license);
};

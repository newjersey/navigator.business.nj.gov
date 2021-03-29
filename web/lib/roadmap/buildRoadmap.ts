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
  AddOn,
} from "../types/types";
import genericTaskAddOns from "../../roadmaps/generic/generic-tasks.json";
import genericRoadmap from "../../roadmaps/generic/generic.json";

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

export const buildRoadmap = async (formData: BusinessForm): Promise<Roadmap> => {
  let roadmapBuilder: RoadmapBuilder = {
    ...genericRoadmap,
    steps: genericRoadmap.steps.map((step: GenericStep) => ({
      ...step,
      tasks: [],
    })),
  };

  roadmapBuilder = addTasksFromAddOn(roadmapBuilder, genericTaskAddOns);

  if (formData.businessType?.businessType === "restaurant") {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/restaurant"));
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/physical-location"));
    if (needsLiquorLicense(formData)) {
      roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/liquor-license"));
    }
  }

  if (formData.businessType?.businessType === "home-contractor") {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/home-contractor"));
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/physical-location"));
  }

  if (formData.businessStructure?.businessStructure) {
    if (PublicRecordFilingGroup.includes(formData.businessStructure?.businessStructure)) {
      roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/public-record-filing"));
    }

    if (TradeNameGroup.includes(formData.businessStructure?.businessStructure)) {
      roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/trade-name"));
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
    roadmap = modifyTasks(roadmap, await importModification("home-contractor"));
  }

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

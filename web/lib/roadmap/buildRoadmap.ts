import {
  AddOn,
  GenericStep,
  LegalStructure,
  OnboardingData,
  Roadmap,
  RoadmapBuilder,
  TaskBuilder,
  TaskModification,
} from "@/lib/types/types";
import genericTaskAddOns from "@/roadmaps/generic/generic-tasks.json";
import steps from "@/roadmaps/steps.json";
import { fetchTaskById } from "@/lib/async-content-fetchers/fetchTaskById";
import { templateEval } from "@/lib/utils/helpers";
import { fetchMunicipalityById } from "@/lib/async-content-fetchers/fetchMunicipalityById";

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
];

export const buildRoadmap = async (onboardingData: OnboardingData): Promise<Roadmap> => {
  let roadmapBuilder: RoadmapBuilder = {
    steps: steps.map((step: GenericStep) => ({
      ...step,
      tasks: [],
    })),
  };

  roadmapBuilder = addTasksFromAddOn(roadmapBuilder, genericTaskAddOns);

  if (!onboardingData.homeBasedBusiness) {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/physical-location"));
  }

  if (onboardingData.liquorLicense) {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/liquor-license"));
    roadmapBuilder = modifyTasks(roadmapBuilder, await importModification("liquor-license"));
  }

  if (onboardingData.industry === "restaurant") {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/restaurant"));
  }

  if (onboardingData.industry === "home-contractor") {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/home-contractor"));
    roadmapBuilder = modifyTasks(roadmapBuilder, await importModification("home-contractor"));
  }

  if (onboardingData.industry === "cosmetology") {
    roadmapBuilder = addTasksFromAddOn(roadmapBuilder, await importAddOns("add-ons/cosmetology"));
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

  let roadmap = {
    ...roadmapBuilder,
    type: onboardingData.industry || "generic",
    steps: await Promise.all(
      roadmapBuilder.steps.map(async (step) => ({
        ...step,
        tasks: await Promise.all(step.tasks.sort(orderByWeight).map((task) => fetchTaskById(task.id))),
      }))
    ),
  };

  if (onboardingData.municipality) {
    roadmap = await addMunicipalitySpecificData(roadmap, onboardingData.municipality.id);
  } else {
    roadmap = cleanupMunicipalitySpecificData(roadmap);
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
  const municipality = await fetchMunicipalityById(municipalityId);
  const evalValues = {
    municipalityWebsite: municipality.townWebsite,
    municipality: municipality.townName,
    county: municipality.countyName,
    countyClerkPhone: municipality.countyClerkPhone,
    countyClerkWebsite: municipality.countyClerkWebsite,
  };

  roadmap.steps.forEach((step) => {
    step.tasks.forEach((task) => {
      task.callToActionLink = templateEval(task.callToActionLink, evalValues);
      task.callToActionText = templateEval(task.callToActionText, evalValues);
      task.contentMd = templateEval(task.contentMd, evalValues);
    });
  });

  return roadmap;
};

const cleanupMunicipalitySpecificData = (roadmap: Roadmap): Roadmap => {
  const evalValues = {
    municipalityWebsite: "",
    municipality: "",
    county: "",
    countyClerkPhone: "",
    countyClerkWebsite: "",
  };

  roadmap.steps.forEach((step) => {
    step.tasks.forEach((task) => {
      task.callToActionLink = templateEval(task.callToActionLink, evalValues);
      task.callToActionText = templateEval(task.callToActionText, evalValues);
      task.contentMd = templateEval(task.contentMd, evalValues);
    });
  });

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

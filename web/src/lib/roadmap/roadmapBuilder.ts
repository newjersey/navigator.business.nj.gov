import { fetchTaskByFilename } from "@/lib/async-content-fetchers/fetchTaskByFilename";
import { Roadmap, SectionType } from "@/lib/types/types";

export const buildRoadmap = async ({
  industryId,
  addOns,
}: {
  industryId: string | undefined;
  addOns: string[];
}): Promise<Roadmap> => {
  const stepImporter: () => Promise<GenericStep[]> = industryId ? importGenericSteps : importForeignSteps;

  const results = await stepImporter();

  let roadmapBuilder: RoadmapBuilder = {
    steps: results.map((step: GenericStep) => ({
      ...step,
    })),
    tasks: [],
  };

  roadmapBuilder = await (industryId
    ? generateIndustryRoadmap(roadmapBuilder, industryId, addOns)
    : applyAddOns(roadmapBuilder, addOns));

  while (hasSteps(roadmapBuilder) && lastStepHasNoTasks(roadmapBuilder)) {
    roadmapBuilder = removeLastStep(roadmapBuilder);
  }
  return convertToRoadmap(roadmapBuilder);
};

const generateIndustryRoadmap = async (
  builder: RoadmapBuilder,
  industryId: string,
  addOns: string[]
): Promise<RoadmapBuilder> => {
  const industryRoadmap: IndustryRoadmap = await importRoadmap(industryId);

  addTasksFromAddOn(builder, industryRoadmap.roadmapSteps);
  await applyAddOns(builder, [...addOns]);
  modifyTasks(builder, industryRoadmap.modifications);

  return builder;
};

const applyAddOns = async (builder: RoadmapBuilder, addOnFilenames: string[]): Promise<RoadmapBuilder> => {
  for (const addOnFilename of addOnFilenames) {
    const addOns = await importAddOn(addOnFilename);
    addTasksFromAddOn(builder, addOns.roadmapSteps);
    modifyTasks(builder, addOns.modifications);
  }

  return builder;
};

const importRoadmap = async (industryId: string): Promise<IndustryRoadmap> => {
  if (process.env.NODE_ENV === "test") {
    const industries = await import(`@/lib/roadmap/fixtures/industries/${industryId}.json`);
    return industries.default as IndustryRoadmap;
  }
  const industries = await import(`@businessnjgovnavigator/content/roadmaps/industries/${industryId}.json`);
  return industries.default as IndustryRoadmap;
};

const importGenericSteps = async (): Promise<GenericStep[]> => {
  if (process.env.NODE_ENV === "test") {
    const steps = await import(`@/lib/roadmap/fixtures/steps.json`);
    return steps.steps as GenericStep[];
  }

  const steps = await import(`@businessnjgovnavigator/content/roadmaps/steps.json`);
  return steps.steps as GenericStep[];
};

const importForeignSteps = async (): Promise<GenericStep[]> => {
  if (process.env.NODE_ENV === "test") {
    const steps = await import(`@/lib/roadmap/fixtures/steps-foreign.json`);
    return steps.steps as GenericStep[];
  }

  const steps = await import(`@businessnjgovnavigator/content/roadmaps/steps-foreign.json`);
  return steps.steps as GenericStep[];
};

const importAddOn = async (relativePath: string): Promise<IndustryRoadmap> => {
  if (process.env.NODE_ENV === "test") {
    return (await import(`@/lib/roadmap/fixtures/add-ons/${relativePath}.json`)) as IndustryRoadmap;
  }

  return (await import(
    `@businessnjgovnavigator/content/roadmaps/add-ons/${relativePath}.json`
  )) as IndustryRoadmap;
};

const orderByWeight = (taskA: TaskBuilder, taskB: TaskBuilder): number => {
  if (taskA.stepNumber == taskB.stepNumber) {
    return taskA.weight > taskB.weight ? 1 : -1;
  } else if (taskA.stepNumber > taskB.stepNumber) {
    return 1;
  } else {
    return -1;
  }
};

const addTasksFromAddOn = (builder: RoadmapBuilder, addOns: AddOn[]): RoadmapBuilder => {
  for (const addOn of addOns) {
    builder.tasks = [
      ...builder.tasks,
      { filename: addOn.task, weight: addOn.weight, stepNumber: addOn.step },
    ];
  }

  return builder;
};

const modifyTasks = (roadmap: RoadmapBuilder, modifications: TaskModification[]): RoadmapBuilder => {
  if (modifications) {
    for (const modification of modifications) {
      const task = findTaskInRoadmapByFilename(roadmap, modification.taskToReplaceFilename);
      if (!task) {
        continue;
      }
      task.filename = modification.replaceWithFilename;
    }
  }

  return roadmap;
};

const findTaskInRoadmapByFilename = (
  roadmapBuilder: RoadmapBuilder,
  taskFilename: string
): TaskBuilder | undefined => {
  return roadmapBuilder.tasks.find((task) => task.filename === taskFilename);
};

const convertToRoadmap = async (roadmapBuilder: RoadmapBuilder): Promise<Roadmap> => {
  const roadmap = {
    steps: roadmapBuilder.steps,
    tasks: await Promise.all(
      roadmapBuilder.tasks.sort(orderByWeight).map(async (task: TaskBuilder) => ({
        ...(await fetchTaskByFilename(task.filename)),
        stepNumber: task.stepNumber,
      }))
    ),
  };

  const allFilenames = new Set(roadmap.tasks.map((task) => task.filename));

  return {
    ...roadmap,
    tasks: roadmap.tasks.map((task) => ({
      ...task,
      unlockedBy: task.unlockedBy.filter((it) => allFilenames.has(it.filename)),
    })),
  };
};

const hasSteps = (roadmap: RoadmapBuilder): boolean => {
  return roadmap.steps.length > 0;
};

const lastStepHasNoTasks = (roadmap: RoadmapBuilder): boolean => {
  const lastStepNumber = roadmap.steps[roadmap.steps.length - 1].stepNumber;
  return roadmap.tasks.every((task) => task.stepNumber !== lastStepNumber);
};

const removeLastStep = (roadmapBuilder: RoadmapBuilder): RoadmapBuilder => {
  roadmapBuilder.steps = roadmapBuilder.steps.splice(0, roadmapBuilder.steps.length - 1);
  return roadmapBuilder;
};

interface RoadmapBuilder {
  steps: StepBuilder[];
  tasks: TaskBuilder[];
}

interface StepBuilder {
  stepNumber: number;
  id: string;
  name: string;
  timeEstimate: string;
  section: SectionType;
  description: string;
}

interface TaskBuilder {
  filename: string;
  weight: number;
  stepNumber: number;
}

interface GenericStep {
  stepNumber: number;
  id: string;
  name: string;
  section: SectionType;
  timeEstimate: string;
  description: string;
}

export interface AddOn {
  step: number;
  weight: number;
  task: string;
}

export interface TaskModification {
  taskToReplaceFilename: string;
  replaceWithFilename: string;
}

export interface IndustryRoadmap {
  roadmapSteps: AddOn[];
  modifications: TaskModification[];
}

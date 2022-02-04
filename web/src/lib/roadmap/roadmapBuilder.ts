import { fetchTaskByFilename } from "@/lib/async-content-fetchers/fetchTaskByFilename";
import { Roadmap, SectionType, Step } from "@/lib/types/types";

export const buildRoadmap = async ({
  industryId,
  addOns,
}: {
  industryId: string;
  addOns: string[];
}): Promise<Roadmap> => {
  let roadmapBuilder: RoadmapBuilder = {
    steps: (await importGenericSteps()).map((step: GenericStep) => ({
      ...step,
      tasks: [],
    })),
  };

  roadmapBuilder = await generateIndustryRoadmap(roadmapBuilder, industryId, addOns);

  if (lastStepHasNoTasks(roadmapBuilder)) {
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
    return (await import(`@/lib/roadmap/fixtures/industries/${industryId}.json`)).default as IndustryRoadmap;
  }
  return (await import(`@businessnjgovnavigator/content/roadmaps/industries/${industryId}.json`))
    .default as IndustryRoadmap;
};

const importGenericSteps = async (): Promise<GenericStep[]> => {
  if (process.env.NODE_ENV === "test") {
    return (await import(`@/lib/roadmap/fixtures/steps.json`)).steps as GenericStep[];
  }

  return (await import(`@businessnjgovnavigator/content/roadmaps/steps.json`)).steps as GenericStep[];
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
  return taskA.weight > taskB.weight ? 1 : -1;
};

const addTasksFromAddOn = (builder: RoadmapBuilder, addOns: AddOn[]): RoadmapBuilder => {
  addOns.forEach((addOn) => {
    const step = builder.steps.find((step) => step.step_number === addOn.step);
    if (!step) {
      return;
    }

    step.tasks = [...step.tasks, { filename: addOn.task, weight: addOn.weight }];
  });

  return builder;
};

const modifyTasks = (roadmap: RoadmapBuilder, modifications: TaskModification[]): RoadmapBuilder => {
  if (modifications) {
    modifications.forEach((modification) => {
      const task = findTaskInRoadmapByFilename(roadmap, modification.taskToReplaceFilename);
      if (!task) {
        return;
      }
      task.filename = modification.replaceWithFilename;
    });
  }

  return roadmap;
};

const findTaskInRoadmapByFilename = (
  roadmapBuilder: RoadmapBuilder,
  taskFilename: string
): TaskBuilder | undefined => {
  for (const step of roadmapBuilder.steps) {
    const found = step.tasks.find((task) => task.filename === taskFilename);
    if (found) return found;
  }
};

const convertToRoadmap = async (roadmapBuilder: RoadmapBuilder): Promise<Roadmap> => {
  const roadmap = {
    steps: await Promise.all(
      roadmapBuilder.steps.map(async (step) => ({
        ...step,
        tasks: await Promise.all(
          step.tasks.sort(orderByWeight).map((task) => fetchTaskByFilename(task.filename))
        ),
      }))
    ),
  };

  const allFilenames = roadmap.steps.reduce(
    (acc: string[], currStep: Step) => [...acc, ...currStep.tasks.map((task) => task.filename)],
    []
  );

  return {
    ...roadmap,
    steps: roadmap.steps.map((step) => ({
      ...step,
      tasks: step.tasks.map((task) => ({
        ...task,
        unlockedBy: task.unlockedBy.filter((it) => allFilenames.includes(it.filename)),
      })),
    })),
  };
};

const lastStepHasNoTasks = (roadmap: RoadmapBuilder): boolean => {
  const lastStep = roadmap.steps[roadmap.steps.length - 1];
  return lastStep.tasks.length === 0;
};

const removeLastStep = (roadmapBuilder: RoadmapBuilder): RoadmapBuilder => {
  roadmapBuilder.steps = roadmapBuilder.steps.splice(0, roadmapBuilder.steps.length - 1);
  return roadmapBuilder;
};

interface RoadmapBuilder {
  steps: StepBuilder[];
}

interface StepBuilder {
  step_number: number;
  id: string;
  name: string;
  timeEstimate: string;
  section: SectionType;
  description: string;
  tasks: TaskBuilder[];
}

interface TaskBuilder {
  filename: string;
  weight: number;
}

interface GenericStep {
  step_number: number;
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

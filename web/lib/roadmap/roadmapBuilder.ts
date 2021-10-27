import { Roadmap, SectionType, Step } from "@/lib/types/types";
import { fetchTaskByFilename } from "@/lib/async-content-fetchers/fetchTaskByFilename";

export const buildRoadmap = async ({
  addOns,
  modifications,
}: {
  addOns: string[];
  modifications: string[];
}): Promise<Roadmap> => {
  let roadmapBuilder: RoadmapBuilder = {
    steps: (await importGenericSteps()).map((step: GenericStep) => ({
      ...step,
      tasks: [],
    })),
  };

  roadmapBuilder = await applyAddOns(roadmapBuilder, ["generic-tasks", ...addOns]);
  roadmapBuilder = await applyModifications(roadmapBuilder, modifications);

  if (lastStepHasNoTasks(roadmapBuilder)) {
    roadmapBuilder = removeLastStep(roadmapBuilder);
  }

  return convertToRoadmap(roadmapBuilder);
};

const applyAddOns = async (builder: RoadmapBuilder, addOnFilenames: string[]): Promise<RoadmapBuilder> => {
  for (const addOnFilename of addOnFilenames) {
    addTasksFromAddOn(builder, await importAddOn(addOnFilename));
  }

  return builder;
};

const applyModifications = async (
  builder: RoadmapBuilder,
  modificationFilenames: string[]
): Promise<RoadmapBuilder> => {
  for (const modificationFilename of modificationFilenames) {
    modifyTasks(builder, await importModification(modificationFilename));
  }

  return builder;
};

const importGenericSteps = async (): Promise<GenericStep[]> => {
  if (process.env.NODE_ENV === "test") {
    return (await import(`@/lib/roadmap/fixtures/steps.json`)).default as GenericStep[];
  }

  return (await import(`../../roadmaps/steps.json`)).default as GenericStep[];
};

const importAddOn = async (relativePath: string): Promise<AddOn[]> => {
  if (process.env.NODE_ENV === "test") {
    return (await import(`@/lib/roadmap/fixtures/add-ons/${relativePath}.json`)).default as AddOn[];
  }

  return (await import(`../../roadmaps/add-ons/${relativePath}.json`)).default as AddOn[];
};

const importModification = async (relativePath: string): Promise<TaskModification[]> => {
  if (process.env.NODE_ENV === "test") {
    return (await import(`@/lib/roadmap/fixtures/modifications/${relativePath}.json`))
      .default as TaskModification[];
  }

  return (await import(`../../roadmaps/modifications/${relativePath}.json`)).default as TaskModification[];
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
  modifications.forEach((modification) => {
    const task = findTaskInRoadmapByFilename(roadmap, modification.taskToReplaceFilename);
    if (!task) {
      return;
    }
    task.filename = modification.replaceWithFilename;
  });

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
        unlocks: task.unlocks.filter((it) => allFilenames.includes(it.filename)),
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

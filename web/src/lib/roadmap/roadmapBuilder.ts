import { fetchTaskByFilename } from "@/lib/async-content-fetchers/fetchTaskByFilename";
import { Roadmap, SectionType, Step } from "@/lib/types/types";

export const buildRoadmap = async ({
  industryId,
  addOns,
}: {
  readonly industryId: string;
  readonly addOns: readonly string[];
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
  addOns: readonly string[]
): Promise<RoadmapBuilder> => {
  const industryRoadmap: IndustryRoadmap = await importRoadmap(industryId);

  addTasksFromAddOn(builder, industryRoadmap.roadmapSteps);
  await applyAddOns(builder, [...addOns]);
  modifyTasks(builder, industryRoadmap.modifications);

  return builder;
};

const applyAddOns = async (
  builder: RoadmapBuilder,
  addOnFilenames: readonly string[]
): Promise<RoadmapBuilder> => {
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

const importGenericSteps = async (): Promise<readonly GenericStep[]> => {
  if (process.env.NODE_ENV === "test") {
    return (await import(`@/lib/roadmap/fixtures/steps.json`)).steps as unknown as readonly GenericStep[];
  }

  return (await import(`@businessnjgovnavigator/content/roadmaps/steps.json`))
    .steps as unknown as readonly GenericStep[];
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

const addTasksFromAddOn = (builder: RoadmapBuilder, addOns: readonly AddOn[]): RoadmapBuilder => {
  // eslint-disable-next-line functional/prefer-readonly-type
  const steps: StepBuilder[] = [];
  builder.steps.forEach((step) => {
    const addOn = addOns.find((a) => step.step_number === a.step);
    if (addOn) {
      const stepTasks = [...step.tasks, { filename: addOn.task, weight: addOn.weight }];
      const compiledStep = {
        ...step,
        tasks: stepTasks,
      };
      steps.push(compiledStep);
    } else {
      steps.push(step);
    }
  });
  return {
    ...builder,
    steps,
  };
};

const modifyTasks = (roadmap: RoadmapBuilder, modifications: readonly TaskModification[]): RoadmapBuilder => {
  // eslint-disable-next-line functional/prefer-readonly-type
  const steps: StepBuilder[] = [];
  roadmap.steps.forEach((step) => {
    // eslint-disable-next-line functional/prefer-readonly-type
    const tasks: TaskBuilder[] = [];
    step.tasks.forEach((task) => {
      const modification = modifications.find((mod) => mod.taskToReplaceFilename == task.filename);
      if (modification) {
        tasks.push({
          ...task,
          filename: modification.replaceWithFilename,
        });
      } else {
        tasks.push(task);
      }
    });
    steps.push({
      ...step,
      tasks,
    });
  });

  return {
    ...roadmap,
    steps,
  };
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
    (acc: readonly string[], currStep: Step) => [...acc, ...currStep.tasks.map((task) => task.filename)],
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
  const steps = roadmapBuilder.steps.slice(0, roadmapBuilder.steps.length - 1);
  return {
    ...roadmapBuilder,
    steps,
  };
};

interface RoadmapBuilder {
  readonly steps: readonly StepBuilder[];
}

interface StepBuilder {
  readonly step_number: number;
  readonly id: string;
  readonly name: string;
  readonly timeEstimate: string;
  readonly section: SectionType;
  readonly description: string;
  readonly tasks: readonly TaskBuilder[];
}

interface TaskBuilder {
  readonly filename: string;
  readonly weight: number;
}

interface GenericStep {
  readonly step_number: number;
  readonly id: string;
  readonly name: string;
  readonly section: SectionType;
  readonly timeEstimate: string;
  readonly description: string;
}

export interface AddOn {
  readonly step: number;
  readonly weight: number;
  readonly task: string;
}

export interface TaskModification {
  readonly taskToReplaceFilename: string;
  readonly replaceWithFilename: string;
}

export interface IndustryRoadmap {
  readonly roadmapSteps: readonly AddOn[];
  readonly modifications: readonly TaskModification[];
}

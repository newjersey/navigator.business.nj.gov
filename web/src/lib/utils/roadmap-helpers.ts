import { KeysOfType, Roadmap, SectionCompletion, Step, Task } from "@/lib/types/types";
import { sectionNames, SectionType, UserData } from "@businessnjgovnavigator/shared/userData";

interface SectionPosition {
  currentSection: SectionType;
  nextSection: SectionType | undefined;
}

export const getSectionNames = (roadmap: Roadmap | undefined): SectionType[] => {
  if (!roadmap) {
    return [];
  }
  const { steps } = roadmap;
  const sections: SectionType[] = [];
  for (const step of steps) {
    sections.push(step.section);
  }
  return [...new Set(sections)];
};

export const getSectionPositions = (
  sectionCompletion: SectionCompletion,
  roadmap: Roadmap,
  taskId: string
): SectionPosition => {
  const currentSection = stepInRoadmap(roadmap, taskId)?.section as SectionType;
  const nextSection = sectionNames
    .slice(sectionNames.indexOf(currentSection))
    .find((currentValue: SectionType) => {
      return !sectionCompletion[currentValue];
    });
  return { currentSection, nextSection };
};

export const getSectionCompletion = (
  roadmap: Roadmap | undefined,
  userData: UserData | undefined
): SectionCompletion => {
  if (!roadmap || !userData) {
    return {} as SectionCompletion;
  }
  const taskMap = sectionsToTasksMap(roadmap) as Record<SectionType, Task[]>;
  return sectionNames.reduce((accumulator, currentValue: SectionType) => {
    accumulator[currentValue] =
      taskMap[currentValue]?.every((task: Task) => {
        return userData.taskProgress[task.id] === "COMPLETED";
      }) ?? false;
    return accumulator;
  }, {} as SectionCompletion);
};

const sectionsToTasksMap = (roadmap: Roadmap | undefined): Record<SectionType, Task[]> | undefined => {
  return roadmap?.steps.reduce((accumulator, currentStep: Step) => {
    const currentStepTasks = roadmap.tasks.filter((task) => {
      return task.stepNumber === currentStep.stepNumber;
    });
    accumulator[currentStep.section] = [...(accumulator[currentStep.section] || []), ...currentStepTasks];
    return accumulator;
  }, {} as Record<SectionType, Task[]>);
};

const stepInRoadmap = (roadmap: Roadmap | undefined, taskId: string): Step | undefined => {
  const taskAtHand = roadmap?.tasks.find((task) => {
    return task.id === taskId;
  });
  if (!taskAtHand) {
    return;
  }
  return roadmap?.steps.find((step) => {
    return step.stepNumber === taskAtHand.stepNumber;
  });
};

export const getTaskFromRoadmap = (roadmap: Roadmap | undefined, taskId: string): Task | undefined => {
  return roadmap?.tasks.find((task) => {
    return task.id === taskId;
  });
};

export const getModifiedTaskContent = (
  roadmap: Roadmap | undefined,
  task: Task,
  field: KeysOfType<Task, string>
): string => {
  const taskInRoadmap = getTaskFromRoadmap(roadmap, task.id);
  if (taskInRoadmap && taskInRoadmap[field] !== task[field]) {
    return taskInRoadmap[field] || "";
  }
  return task[field] || "";
};

export const getModifiedTaskBooleanUndefined = (
  roadmap: Roadmap | undefined,
  task: Task,
  field: KeysOfType<Task, boolean | undefined>
): boolean | undefined => {
  const taskInRoadmap = getTaskFromRoadmap(roadmap, task.id);
  if (taskInRoadmap && taskInRoadmap[field] !== task[field]) {
    return taskInRoadmap[field] || undefined;
  }
  return task[field] || undefined;
};

export const getUrlSlugs = (roadmap: Roadmap | undefined): string[] => {
  if (!roadmap) {
    return [];
  }
  return roadmap.tasks.map((task) => {
    return task.urlSlug;
  });
};

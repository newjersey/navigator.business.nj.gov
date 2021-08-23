import { useEffect, useRef } from "react";
import { Roadmap, Step, Task, UserData } from "@/lib/types/types";

export const useMountEffect = (fun: () => void): void => useEffect(fun, []);

export const useOnWindowResize = (fun: () => void): void =>
  useEffect(() => {
    window.addEventListener("resize", fun);
    return function cleanup() {
      window.removeEventListener("resize", fun);
    };
  });

export const useMountEffectWhenDefined = (fun: () => void, thingToBeDefined: unknown | undefined): void => {
  const effectOccurred = useRef<boolean>(false);
  useEffect(() => {
    if (thingToBeDefined && !effectOccurred.current) {
      effectOccurred.current = true;
      fun();
    }
  }, [thingToBeDefined]);
};

export const onEscape = (e: KeyboardEvent, handler: () => void): void => {
  if (e.key === "Escape") {
    e.preventDefault();
    handler();
  }
};

export const templateEval = (template: string, args: Record<string, string>): string =>
  template.replace(/\${(\w+)}/g, (_, v) => args[v]);

const getTaskFromRoadmap = (roadmap: Roadmap | undefined, taskId: string): Task | undefined => {
  const stepInRoadmap = roadmap?.steps.find((step) => step.tasks.find((task) => task.id === taskId));
  return stepInRoadmap?.tasks.find((task) => task.id === taskId);
};

export const getModifiedTaskContent = (
  roadmap: Roadmap | undefined,
  task: Task,
  field: keyof Task
): string => {
  const taskInRoadmap = getTaskFromRoadmap(roadmap, task.id);
  if (taskInRoadmap && taskInRoadmap[field] !== task[field]) {
    return taskInRoadmap[field];
  }
  return task[field];
};

export const rswitch = <T>(param: string, cases: { default: T; [k: string]: T }): T => {
  if (cases[param]) {
    return cases[param];
  } else {
    return cases.default;
  }
};

export const scrollToTop = (): void => {
  window.scrollTo(0, 0);
};

export const isStepCompleted = (step: Step, userData: UserData | undefined): boolean => {
  return step.tasks.every((it) => {
    const taskProgress = (userData?.taskProgress && userData.taskProgress[it.id]) || "NOT_STARTED";
    return taskProgress === "COMPLETED";
  });
};

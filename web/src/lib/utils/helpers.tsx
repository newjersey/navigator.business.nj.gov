import React, { useEffect, useRef, ReactElement } from "react";
import {
  Roadmap,
  Step,
  Task,
  UserData,
  SectionType,
  SectionCompletion,
  Preferences,
  sectionNames,
  OnboardingStatus,
  ProfileError,
} from "@/lib/types/types";
import { NavDefaults } from "@/display-defaults/NavDefaults";
import { ProfileDefaults } from "@/display-defaults/ProfileDefaults";
import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";

// eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [thingToBeDefined, fun]);
};

export const onEscape = (e: KeyboardEvent, handler: () => void): void => {
  if (e.key === "Escape") {
    e.preventDefault();
    handler();
  }
};

export const templateEval = (template: string, args: Record<string, string>): string =>
  template.replace(/\${(\w+)}/g, (_, v) => args[v]);

export const getTaskFromRoadmap = (roadmap: Roadmap | undefined, taskId: string): Task | undefined =>
  stepInRoadmap(roadmap, taskId)?.tasks.find((task) => task.id === taskId);

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
      taskMap[currentValue]?.every((task: Task) => userData.taskProgress[task.id] === "COMPLETED") ?? false;
    return accumulator;
  }, {} as SectionCompletion);
};
interface SectionPosition {
  current: SectionType;
  next: SectionType | undefined;
}

export const getSectionPositions = (
  sectionCompletion: SectionCompletion,
  roadmap: Roadmap,
  taskId: string
): SectionPosition => {
  const currentSection = stepInRoadmap(roadmap, taskId)?.section as SectionType;
  const nextSection = sectionNames
    .slice(sectionNames.indexOf(currentSection))
    .find((currentValue: SectionType) => !sectionCompletion[currentValue]);
  return { current: currentSection, next: nextSection };
};

export const setPreferencesCloseSection = (preferences: Preferences, current: SectionType): Preferences => {
  return {
    ...preferences,
    roadmapOpenSections: preferences.roadmapOpenSections.filter((currentValue) => currentValue !== current),
  } as Preferences;
};

export const getModifiedTaskContent = (
  roadmap: Roadmap | undefined,
  task: Task,
  field: Exclude<keyof Task, "unlockedBy" | "unlocks">
): string => {
  const taskInRoadmap = getTaskFromRoadmap(roadmap, task.id);
  if (taskInRoadmap && taskInRoadmap[field] !== task[field]) {
    return taskInRoadmap[field] || "";
  }
  return task[field] || "";
};

export const rswitch = <T,>(param: string, cases: { default: T; [k: string]: T }): T => {
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

interface AlertProps {
  variant: "success" | "warning" | "error";
  body: string;
  header?: string;
  link?: string;
}

export const OnboardingStatusLookup: Record<OnboardingStatus, AlertProps> = {
  SUCCESS: {
    body: ProfileDefaults.successTextBody,
    header: ProfileDefaults.successTextHeader,
    link: ProfileDefaults.successTextLink,
    variant: "success",
  },
  ERROR: {
    body: ProfileDefaults.errorTextBody,
    header: ProfileDefaults.errorTextHeader,
    variant: "error",
  },
};

export const OnboardingErrorLookup: Record<ProfileError, string> = {
  REQUIRED_LEGAL: OnboardingDefaults.errorTextRequiredLegal,
};

export const getUserNameOrEmail = (userData: UserData | undefined): string => {
  if (userData?.user.name) return userData.user.name;
  else if (userData?.user.email) return userData.user.email;
  else return NavDefaults.myNJAccountText;
};

export const getUrlSlugs = (roadmap: Roadmap | undefined): string[] => {
  if (!roadmap) return [];
  const { steps } = roadmap;
  return steps.reduce((acc: string[], currStep: Step) => {
    const { tasks } = currStep;
    return [...acc, ...tasks.map((task) => task.urlSlug)];
  }, []);
};

export const setHeaderRole = (
  ariaLevel: number,
  classProperties?: string
): (({ children }: { children: string[] }) => ReactElement) => {
  const createElement = ({ children }: { children: string[] }): ReactElement => {
    return (
      <div role="heading" aria-level={ariaLevel} className={classProperties ? classProperties : ""}>
        {children}
      </div>
    );
  };

  return createElement;
};

export const getSectionNames = (roadmap: Roadmap | undefined): SectionType[] => {
  if (!roadmap) return [];
  const { steps } = roadmap;
  const sections: SectionType[] = [];
  steps.forEach((step) => {
    sections.push(step.section);
  });
  return [...new Set(sections)];
};

export const createRoadmapSections = (
  roadmapSections: SectionType[],
  userData: UserData | undefined,
  getSection: (sectionName: SectionType, openStatus: boolean | undefined) => JSX.Element
): JSX.Element[] => {
  return roadmapSections.map((sectionName) => {
    const openStatus = userData?.preferences.roadmapOpenSections.includes(sectionName);
    return getSection(sectionName, openStatus);
  });
};

export const camelCaseToSentence = (text: string): string => {
  const spacedCase = text
    .split(/(?=[A-Z])/)
    .join(" ")
    .toLowerCase();
  return spacedCase.charAt(0).toUpperCase() + spacedCase.slice(1);
};
const sectionsToTasksMap = (roadmap: Roadmap | undefined): Record<SectionType, Task[]> | undefined =>
  roadmap?.steps.reduce((accumulator, currentValue: Step) => {
    accumulator[currentValue.section] = [...(accumulator[currentValue.section] || []), ...currentValue.tasks];
    return accumulator;
  }, {} as Record<SectionType, Task[]>);

const stepInRoadmap = (roadmap: Roadmap | undefined, taskId: string): Step | undefined =>
  roadmap?.steps.find((step) => step.tasks.find((task) => task.id === taskId));

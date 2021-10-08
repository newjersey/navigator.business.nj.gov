import { useEffect, useRef, ReactElement } from "react";
import { Roadmap, Step, Task, UserData, SectionType, OnboardingError } from "@/lib/types/types";
import { NavDefaults } from "@/display-content/NavDefaults";
import { OnboardingDefaults } from "@/display-content/onboarding/OnboardingDefaults";

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

export const getTaskFromRoadmap = (roadmap: Roadmap | undefined, taskId: string): Task | undefined => {
  const stepInRoadmap = roadmap?.steps.find((step) => step.tasks.find((task) => task.id === taskId));
  return stepInRoadmap?.tasks.find((task) => task.id === taskId);
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

export const OnboardingErrorLookup: Record<OnboardingError, string> = {
  REQUIRED_LEGAL: OnboardingDefaults.errorTextRequiredLegal,
  REQUIRED_MUNICIPALITY: OnboardingDefaults.errorTextRequiredMunicipality,
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

export const handleAccordionStateChange = async (
  sectionType: SectionType,
  expanded: boolean | undefined,
  userData: UserData | undefined,
  update: (newUserData: UserData | undefined) => Promise<void>
): Promise<void> => {
  const roadmapOpenSections = userData?.preferences.roadmapOpenSections;
  if (!roadmapOpenSections) return;

  if (expanded) {
    const newUserData = {
      ...userData,
      preferences: {
        ...userData.preferences,
        roadmapOpenSections: roadmapOpenSections?.filter(
          (roadmapOpenSection) => roadmapOpenSection !== sectionType
        ),
      },
    };

    await update(newUserData);
  } else {
    const newUserData = {
      ...userData,
      preferences: {
        ...userData?.preferences,
        roadmapOpenSections: [...userData?.preferences.roadmapOpenSections, sectionType],
      },
    };

    await update(newUserData);
  }
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

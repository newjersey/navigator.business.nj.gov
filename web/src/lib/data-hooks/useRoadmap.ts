import { RoadmapContext } from "@/contexts/roadmapContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { Roadmap, Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/operatingPhase";
import { SectionType, TaskProgress, sectionNames } from "@businessnjgovnavigator/shared/userData";
import { useContext, useMemo } from "react";

export type CurrentAndNextSection = { current: SectionType; next: SectionType | undefined };

export type UseRoadmapReturnValue = {
  roadmap: Roadmap | undefined;
  sectionNamesInRoadmap: SectionType[];
  isSectionCompleted: (section: SectionType, taskProgressOverride?: Record<string, TaskProgress>) => boolean;
  currentAndNextSection: (taskId: string) => CurrentAndNextSection;
};

export const useRoadmap = (): UseRoadmapReturnValue => {
  const { roadmap, setRoadmap } = useContext(RoadmapContext);
  const { business } = useUserData();

  const isDomesticEmployer = business?.profileData.operatingPhase === OperatingPhaseId.DOMESTIC_EMPLOYER;

  const sectionNamesInRoadmap = useMemo(() => {
    if (!roadmap) {
      return [];
    }
    const { steps } = roadmap;
    const sections: SectionType[] = steps
      .filter((step) => {
        if (step.section === "DOMESTIC_EMPLOYER_SECTION") {
          return isDomesticEmployer;
        }
        if (step.section === "PLAN") {
          return !isDomesticEmployer;
        }
        return true;
      })
      .map((step) => step.section);
    return [...new Set(sections)];
  }, [roadmap, isDomesticEmployer]);

  const rebuildRoadmap = !roadmap || roadmap?.steps.length === 0 || roadmap?.tasks.length === 0;

  useMountEffectWhenDefined(() => {
    if (rebuildRoadmap) {
      buildAndSetRoadmap();
    }
  }, business);

  const buildAndSetRoadmap = async (): Promise<void> => {
    if (business?.onboardingFormProgress === "COMPLETED") {
      const roadmap = await buildUserRoadmap(business.profileData);
      setRoadmap(roadmap);
    }
  };

  const tasksInSection = (section: SectionType): Task[] => {
    if (!roadmap) return [];
    const stepsInSection = roadmap.steps.filter((step) => step.section === section);
    return roadmap.tasks.filter((task) => {
      if (!task.stepNumber) return false;
      return stepsInSection.map((it) => it.stepNumber).includes(task.stepNumber);
    });
  };

  const sectionOfTask = (taskId: string): SectionType | undefined => {
    const taskAtHand = roadmap?.tasks.find((task) => {
      return task.id === taskId;
    });
    if (!taskAtHand) {
      return;
    }
    const step = roadmap?.steps.find((step) => {
      return step.stepNumber === taskAtHand.stepNumber;
    });
    return step?.section;
  };

  const nextUncompletedSection = (currentSection: SectionType): SectionType | undefined => {
    return sectionNames.slice(sectionNames.indexOf(currentSection) + 1).find((section: SectionType) => {
      return !isSectionCompleted(section);
    });
  };

  const currentAndNextSection = (
    taskId: string
  ): {
    current: SectionType;
    next: SectionType | undefined;
  } => {
    const current = sectionOfTask(taskId) as SectionType;
    return {
      current,
      next: nextUncompletedSection(current),
    };
  };

  const isSectionCompleted = (
    section: SectionType,
    taskProgressOverride?: Record<string, TaskProgress>
  ): boolean => {
    if (!business) return false;
    return tasksInSection(section).every((task) => {
      const status = taskProgressOverride ? taskProgressOverride[task.id] : business.taskProgress[task.id];
      return status === "COMPLETED";
    });
  };

  return { roadmap, sectionNamesInRoadmap, isSectionCompleted, currentAndNextSection };
};

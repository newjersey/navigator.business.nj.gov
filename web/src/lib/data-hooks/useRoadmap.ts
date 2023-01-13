import { RoadmapContext } from "@/contexts/roadmapContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { Roadmap, Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { SectionType } from "@businessnjgovnavigator/shared/userData";
import { useContext, useMemo } from "react";

export type UseRoadmapReturnValue = {
  roadmap: Roadmap | undefined;
  sectionNamesInRoadmap: SectionType[];
  isSectionCompleted: (section: SectionType) => boolean;
};

export const useRoadmap = (): UseRoadmapReturnValue => {
  const { roadmap, setRoadmap } = useContext(RoadmapContext);
  const { userData } = useUserData();

  const sectionNamesInRoadmap = useMemo(() => {
    if (!roadmap) {
      return [];
    }
    const { steps } = roadmap;
    const sections: SectionType[] = [];
    for (const step of steps) {
      sections.push(step.section);
    }
    return [...new Set(sections)];
  }, [roadmap]);

  useMountEffectWhenDefined(() => {
    if (!roadmap) {
      buildAndSetRoadmap();
    }
  }, userData);

  const buildAndSetRoadmap = async () => {
    if (userData?.formProgress === "COMPLETED") {
      const roadmap = await buildUserRoadmap(userData.profileData);
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

  const isSectionCompleted = (section: SectionType): boolean => {
    if (!userData) return false;
    return tasksInSection(section).every((task) => {
      return userData.taskProgress[task.id] === "COMPLETED";
    });
  };

  return { roadmap, sectionNamesInRoadmap, isSectionCompleted };
};

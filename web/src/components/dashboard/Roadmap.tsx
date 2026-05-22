import { BusinessStructurePrompt } from "@/components/dashboard/BusinessStructurePrompt";
import { SectionAccordion } from "@/components/dashboard/SectionAccordion";
import { Step } from "@/components/Step";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  hasCompletedBusinessStructure,
  LookupOperatingPhaseById,
} from "@businessnjgovnavigator/shared/";
import { ReactElement } from "react";

export const Roadmap = (): ReactElement => {
  const { roadmap, sectionNamesInRoadmap } = useRoadmap();
  const { updateQueue, business } = useUserData();

  const displayBusinessStructurePrompt = LookupOperatingPhaseById(
    updateQueue?.currentBusiness().profileData.operatingPhase,
  ).displayBusinessStructurePrompt;

  const completedBusinessStructure = hasCompletedBusinessStructure(updateQueue?.currentBusiness());

  return (
    <>
      {sectionNamesInRoadmap.map((section) => {
        const isInSection = (step: { section: string }): boolean => step.section === section;
        const isInStep = (task: { stepNumber?: number }): boolean =>
          task.stepNumber !== undefined && stepNumbersInSection.includes(task.stepNumber);
        const isCompleted = (task: { id: string }): boolean =>
          business?.taskProgress[task.id] === "COMPLETED";

        const stepNumbersInSection = roadmap
          ? roadmap.steps.filter(isInSection).map((step) => step.stepNumber)
          : [];
        const tasksInSection = roadmap ? roadmap.tasks.filter(isInStep) : [];
        const completedCount = tasksInSection.filter(isCompleted).length;
        const totalCount = tasksInSection.length;
        const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return (
          <SectionAccordion key={section} sectionType={section} progressPercentage={percentage}>
            {section === "START" &&
            !completedBusinessStructure &&
            displayBusinessStructurePrompt ? (
              <BusinessStructurePrompt />
            ) : (
              roadmap &&
              roadmap.steps.filter(isInSection).map((step, index, array) => {
                return <Step key={step.stepNumber} step={step} last={index === array.length - 1} />;
              })
            )}
          </SectionAccordion>
        );
      })}
    </>
  );
};

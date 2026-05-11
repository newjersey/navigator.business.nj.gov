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
        const stepNumbersInSection = roadmap
          ? roadmap.steps.filter((step) => step.section === section).map((step) => step.stepNumber)
          : [];
        const tasksInSection = roadmap
          ? roadmap.tasks.filter(
              (task) =>
                task.stepNumber !== undefined && stepNumbersInSection.includes(task.stepNumber),
            )
          : [];
        const completedCount = tasksInSection.filter(
          (task) => business?.taskProgress[task.id] === "COMPLETED",
        ).length;
        const percentage =
          tasksInSection.length > 0
            ? Math.round((completedCount / tasksInSection.length) * 100)
            : 0;

        return (
          <SectionAccordion key={section} sectionType={section} progressPercentage={percentage}>
            {section === "START" &&
            !completedBusinessStructure &&
            displayBusinessStructurePrompt ? (
              <BusinessStructurePrompt />
            ) : (
              roadmap &&
              roadmap.steps
                .filter((step) => {
                  return step.section === section;
                })
                .map((step, index, array) => {
                  return (
                    <Step key={step.stepNumber} step={step} last={index === array.length - 1} />
                  );
                })
            )}
          </SectionAccordion>
        );
      })}
    </>
  );
};

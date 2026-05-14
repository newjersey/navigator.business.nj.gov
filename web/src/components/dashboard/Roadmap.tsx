import { BusinessStructurePrompt } from "@/components/dashboard/BusinessStructurePrompt";
import { SectionAccordionCard } from "@/components/dashboard/SectionAccordionCard";
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
          <SectionAccordionCard key={section} sectionType={section} progressPercentage={percentage}>
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
                    <div key={step.stepNumber}>
                      <Step
                        step={step}
                        last={index === array.length - 1}
                        hideVerticalLine
                        showCheckboxes
                      />
                      {index !== array.length - 1 && (
                        <div className="margin-bottom-3 border-1px border-cool-lighter" />
                      )}
                    </div>
                  );
                })
            )}
          </SectionAccordionCard>
        );
      })}
    </>
  );
};

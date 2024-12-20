import { BusinessStructurePrompt } from "@/components/dashboard/BusinessStructurePrompt";
import { SectionAccordion } from "@/components/dashboard/SectionAccordion";
import { Step } from "@/components/Step";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { hasCompletedBusinessStructure, LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import { ReactElement } from "react";

export const Roadmap = (): ReactElement<any> => {
  const { roadmap, sectionNamesInRoadmap } = useRoadmap();
  const { updateQueue } = useUserData();

  const displayBusinessStructurePrompt = LookupOperatingPhaseById(
    updateQueue?.currentBusiness().profileData.operatingPhase
  ).displayBusinessStructurePrompt;

  const completedBusinessStructure = hasCompletedBusinessStructure(updateQueue?.currentBusiness());

  return (
    <>
      {sectionNamesInRoadmap.map((section) => {
        return (
          <SectionAccordion key={section} sectionType={section}>
            {section === "START" && !completedBusinessStructure && displayBusinessStructurePrompt ? (
              <BusinessStructurePrompt />
            ) : (
              roadmap &&
              roadmap.steps
                .filter((step) => {
                  return step.section === section;
                })
                .map((step, index, array) => {
                  return <Step key={step.stepNumber} step={step} last={index === array.length - 1} />;
                })
            )}
          </SectionAccordion>
        );
      })}
    </>
  );
};

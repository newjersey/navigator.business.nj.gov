import { BusinessStructurePrompt } from "@/components/dashboard/BusinessStructurePrompt";
import { SectionAccordion } from "@/components/dashboard/SectionAccordion";
import { Step } from "@/components/Step";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import { ReactElement } from "react";

export const Roadmap = (): ReactElement => {
  const { roadmap, sectionNamesInRoadmap } = useRoadmap();
  const { updateQueue } = useUserData();

  const displayBusinessStructurePrompt = LookupOperatingPhaseById(
    updateQueue?.current().profileData.operatingPhase
  ).displayBusinessStructurePrompt;

  const renderPlanSection = (
    <SectionAccordion key={sectionNamesInRoadmap[0]} sectionType={sectionNamesInRoadmap[0]}>
      {roadmap &&
        roadmap.steps
          .filter((step) => {
            return step.section === sectionNamesInRoadmap[0];
          })
          .map((step, index, array) => {
            return <Step key={step.stepNumber} step={step} last={index === array.length - 1} />;
          })}
    </SectionAccordion>
  );
  const renderStartSection = (
    <SectionAccordion
      key={sectionNamesInRoadmap[1]}
      sectionType={sectionNamesInRoadmap[1]}
      isDividerDisabled={displayBusinessStructurePrompt}
    >
      {displayBusinessStructurePrompt ? (
        <BusinessStructurePrompt />
      ) : (
        roadmap &&
        roadmap.steps
          .filter((step) => {
            return step.section === sectionNamesInRoadmap[1];
          })
          .map((step, index, array) => {
            return <Step key={step.stepNumber} step={step} last={index === array.length - 1} />;
          })
      )}
    </SectionAccordion>
  );

  return (
    <>
      {sectionNamesInRoadmap[0] && renderPlanSection}
      {sectionNamesInRoadmap[1] && renderStartSection}
    </>
  );
};

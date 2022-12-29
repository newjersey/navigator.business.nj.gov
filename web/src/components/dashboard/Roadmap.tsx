import { SectionAccordion } from "@/components/dashboard/SectionAccordion";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { ReactElement } from "react";
import { Step } from "../Step";

export const Roadmap = (): ReactElement => {
  const { roadmap, sectionNamesInRoadmap } = useRoadmap();

  return (
    <>
      {sectionNamesInRoadmap.map((section) => {
        return (
          <SectionAccordion key={section} sectionType={section}>
            {roadmap &&
              roadmap.steps
                .filter((step) => {
                  return step.section === section;
                })
                .map((step, index, array) => {
                  return <Step key={step.stepNumber} step={step} last={index === array.length - 1} />;
                })}
          </SectionAccordion>
        );
      })}
    </>
  );
};

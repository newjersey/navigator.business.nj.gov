import React, { ReactElement } from "react";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { createRoadmapSections, getSectionNames, handleAccordionStateChange } from "@/lib/utils/helpers";
import { CircularProgress, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Step } from "@/components/Step";
import { SectionDefaults } from "@/display-content/roadmap/RoadmapDefaults";
import { SectionType } from "@/lib/types/types";
import { Icon } from "@/components/njwds/Icon";
import { useUserData } from "@/lib/data-hooks/useUserData";

export const RoadmapBySections = (): ReactElement => {
  const { roadmap } = useRoadmap();
  const roadmapSections = getSectionNames(roadmap);
  const { userData, update } = useUserData();

  const getSection = (sectionType: SectionType, openAccordion: boolean | undefined) => {
    const sectionName = sectionType.toLowerCase();
    const publicName = SectionDefaults[sectionType];
    return (
      <div key={sectionName} data-testid={`section-${sectionName}`}>
        <Accordion
          elevation={0}
          expanded={openAccordion}
          onChange={() => handleAccordionStateChange(sectionType, openAccordion, userData, update)}
        >
          <AccordionSummary
            expandIcon={<Icon className="usa-icon--size-5 margin-x-1">expand_more</Icon>}
            aria-controls={`${sectionName}-content`}
            id={`${sectionName}-header`}
          >
            <h2 className="flex flex-align-center margin-top-3 margin-bottom-2 tablet:margin-left-3">
              <img src={`/img/section-header-${sectionName}.svg`} alt="section" />{" "}
              <span className="padding-left-205">{publicName}</span>
            </h2>
          </AccordionSummary>
          <AccordionDetails>
            {roadmap &&
              roadmap.steps
                .filter((step) => step.section === sectionType)
                .map((step, index, array) => (
                  <Step key={step.step_number} step={step} last={index === array.length - 1} />
                ))}
          </AccordionDetails>
        </Accordion>
        <hr className="margin-y-3 bg-base-lighter" />
      </div>
    );
  };

  return (
    <div className="margin-top-3">
      {!roadmap ? (
        <div className="fdr fjc fac">
          <CircularProgress />
          <h3 className="margin-left-2">Loading...</h3>
        </div>
      ) : (
        createRoadmapSections(roadmapSections, userData, getSection)
      )}
    </div>
  );
};

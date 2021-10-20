import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import React, { ReactElement, ReactNode } from "react";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SectionType } from "@/lib/types/types";
import { Icon } from "@/components/njwds/Icon";
import { SectionDefaults } from "@/display-content/roadmap/RoadmapDefaults";

interface Props {
  sectionType: SectionType;
  children: ReactNode;
  mini?: boolean;
}

export const SectionAccordion = (props: Props): ReactElement => {
  const { userData, update } = useUserData();

  const dropdownIconClasses = props.mini ? "usa-icon--size-3 text-ink" : "usa-icon--size-5 margin-x-1";
  const headerClasses = props.mini ? "" : "margin-top-3 tablet:margin-left-3";
  const sectionIconClasses = props.mini ? "height-4 padding-right-105" : "height-5 padding-right-205";
  const dividerClasses = props.mini ? "margin-y-2" : "margin-y-3";

  const sectionName = props.sectionType.toLowerCase();
  const isOpen = userData?.preferences.roadmapOpenSections.includes(props.sectionType);

  const handleAccordionStateChange = async (): Promise<void> => {
    const roadmapOpenSections = userData?.preferences.roadmapOpenSections;
    if (!roadmapOpenSections) return;

    if (isOpen) {
      const newUserData = {
        ...userData,
        preferences: {
          ...userData.preferences,
          roadmapOpenSections: roadmapOpenSections?.filter(
            (roadmapOpenSection) => roadmapOpenSection !== props.sectionType
          ),
        },
      };

      await update(newUserData);
    } else {
      const newUserData = {
        ...userData,
        preferences: {
          ...userData?.preferences,
          roadmapOpenSections: [...userData?.preferences.roadmapOpenSections, props.sectionType],
        },
      };

      await update(newUserData);
    }
  };

  return (
    <div data-testid={`section-${sectionName}`}>
      <Accordion elevation={0} expanded={isOpen} onChange={handleAccordionStateChange}>
        <AccordionSummary
          expandIcon={<Icon className={dropdownIconClasses}>expand_more</Icon>}
          aria-controls={`${sectionName}-content`}
          id={`${sectionName}-header`}
          data-testid={`${sectionName}-header`}
        >
          <h2 className={`flex flex-align-center margin-y-2 ${headerClasses}`}>
            <img
              role="presentation"
              className={sectionIconClasses}
              alt=""
              src={`/img/section-header-${sectionName}.svg`}
            />{" "}
            <div className="inline" aria-label={`Section ${sectionName}`}>
              {SectionDefaults[props.sectionType]}
            </div>
          </h2>
        </AccordionSummary>
        <AccordionDetails>{props.children}</AccordionDetails>
      </Accordion>
      <hr className={`${dividerClasses} bg-base-lighter`} />
    </div>
  );
};

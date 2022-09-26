import { Icon } from "@/components/njwds/Icon";
import { SectionAccordionContext } from "@/contexts/sectionAccordionContext";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { SectionType } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Accordion, AccordionDetails, AccordionSummary, useMediaQuery } from "@mui/material";
import { ReactElement, ReactNode } from "react";

interface Props {
  sectionType: SectionType;
  children: ReactNode;
  mini?: boolean;
}

export const SectionAccordion = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const { sectionCompletion } = useRoadmap();
  const dropdownIconClasses = props.mini
    ? "usa-icon--size-3 text-base-darkest"
    : "usa-icon--size-5 margin-x-1";
  const headerClasses = props.mini ? "h3-styling" : "margin-top-3 tablet:margin-left-3 h3-styling";
  const sectionIconClasses = props.mini ? "height-4 padding-right-105" : "height-5 padding-right-105";
  const dividerClasses = props.mini ? "margin-y-2" : "margin-y-3";
  const sectionName = props.sectionType.toLowerCase();
  const isOpen = userData?.preferences.roadmapOpenSections.includes(props.sectionType) ?? false;
  const isCompleted = sectionCompletion ? sectionCompletion[props.sectionType] : false;
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const handleAccordionStateChange = async (): Promise<void> => {
    const roadmapOpenSections = userData?.preferences.roadmapOpenSections;
    if (!roadmapOpenSections) return;
    analytics.event.roadmap_section.click.expand_contract();
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
          roadmapOpenSections: [...roadmapOpenSections, props.sectionType],
        },
      };

      await update(newUserData);
    }
  };

  return (
    <div data-testid={`section-${sectionName}`}>
      <SectionAccordionContext.Provider value={{ isOpen }}>
        <Accordion elevation={0} expanded={isOpen} onChange={handleAccordionStateChange}>
          <AccordionSummary
            expandIcon={<Icon className={dropdownIconClasses}>expand_more</Icon>}
            aria-controls={`${sectionName}-content`}
            id={`${sectionName}-header`}
            data-testid={`${sectionName}-header`}
          >
            <div className="margin-y-2">
              <h2 className={`flex flex-align-center margin-0-override ${headerClasses}`}>
                <img
                  role="presentation"
                  className={sectionIconClasses}
                  src={isCompleted ? `/img/section-complete.svg` : `/img/section-header-${sectionName}.svg`}
                  alt=""
                  data-testid={`${isCompleted ? "completed" : "regular"}-${sectionName}-section-img`}
                />
                <div className="inline">{Config.sectionHeaders[props.sectionType]}</div>
              </h2>
            </div>
          </AccordionSummary>
          <AccordionDetails>{props.children}</AccordionDetails>
        </Accordion>
      </SectionAccordionContext.Provider>
      <hr className={dividerClasses} />
    </div>
  );
};

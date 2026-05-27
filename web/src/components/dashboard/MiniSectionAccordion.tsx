import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { SectionAccordionContext } from "@/contexts/sectionAccordionContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { SectionType } from "@businessnjgovnavigator/shared";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement, ReactNode } from "react";

interface MiniSectionAccordionProps {
  sectionType: SectionType;
  children: ReactNode;
  isDividerDisabled?: boolean;
}

export const MiniSectionAccordion = (props: MiniSectionAccordionProps): ReactElement => {
  const { updateQueue, business } = useUserData();
  const dropdownIconClasses = "usa-icon--size-5 text-base-light";
  const dividerClasses = "margin-y-2";
  const sectionName = props.sectionType.toLowerCase();
  const isOpen = business?.preferences.roadmapOpenSections.includes(props.sectionType) ?? false;
  const { Config } = useConfig();

  const handleAccordionStateChange = async (): Promise<void> => {
    const roadmapOpenSections = business?.preferences.roadmapOpenSections;
    if (!roadmapOpenSections) {
      return;
    }
    analytics.event.roadmap_section.click.expand_contract();
    if (isOpen) {
      await updateQueue
        ?.queuePreferences({
          roadmapOpenSections: roadmapOpenSections?.filter((roadmapOpenSection) => {
            return roadmapOpenSection !== props.sectionType;
          }),
        })
        .update();
    } else {
      await updateQueue
        ?.queuePreferences({
          roadmapOpenSections: [...roadmapOpenSections, props.sectionType],
        })
        .update();
    }
  };

  return (
    <div data-testid={`section-${sectionName}`}>
      <SectionAccordionContext.Provider value={{ isOpen }}>
        <Accordion expanded={isOpen} onChange={handleAccordionStateChange}>
          <AccordionSummary
            expandIcon={<Icon className={dropdownIconClasses} iconName="expand_more" />}
            aria-controls={`${sectionName}-content`}
            id={`${sectionName}-header`}
            data-testid={`${sectionName}-header`}
          >
            <Heading level={3} className="flex flex-align-center margin-0-override">
              <div className="inline">{Config.sectionHeaders[props.sectionType]}</div>
            </Heading>
          </AccordionSummary>
          <AccordionDetails>{props.children}</AccordionDetails>
        </Accordion>
      </SectionAccordionContext.Provider>
      {!props.isDividerDisabled && <hr className={dividerClasses} />}
    </div>
  );
};

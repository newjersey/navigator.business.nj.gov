import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { SectionAccordionContext } from "@/contexts/sectionAccordionContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { SectionType } from "@businessnjgovnavigator/shared";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement, ReactNode } from "react";

interface Props {
  sectionType: SectionType;
  children: ReactNode;
  mini?: boolean;
  isDividerDisabled?: boolean;
}

export const SectionAccordion = (props: Props): ReactElement<any> => {
  const { updateQueue, business } = useUserData();
  const dropdownIconClasses = props.mini
    ? "usa-icon--size-5 text-base-light"
    : "usa-icon--size-5 margin-left-1";
  const headerClasses = props.mini ? "" : "margin-top-3 tablet:margin-left-3";
  const dividerClasses = props.mini ? "margin-y-2" : "margin-y-3";
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
            <div className="margin-y-05">
              <Heading level={3} className={`flex flex-align-center margin-0-override ${headerClasses}`}>
                <div className="inline">{Config.sectionHeaders[props.sectionType]}</div>
              </Heading>
            </div>
          </AccordionSummary>
          <AccordionDetails>{props.children}</AccordionDetails>
        </Accordion>
      </SectionAccordionContext.Provider>
      {!props.isDividerDisabled && <hr className={dividerClasses} />}
    </div>
  );
};

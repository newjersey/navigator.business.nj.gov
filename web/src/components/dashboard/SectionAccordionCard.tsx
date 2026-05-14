import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { ProgressBar } from "@/components/ProgressBar";
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
  progressPercentage?: number;
}

const progressLabelStage = (percentage: number): string => {
  if (percentage === 0) return "zero";
  if (percentage < 50) return "low";
  if (percentage < 90) return "mid";
  return "high";
};

export const SectionAccordionCard = (props: Props): ReactElement => {
  const { updateQueue, business } = useUserData();
  const dropdownIconClasses = props.mini
    ? "usa-icon--size-5 text-base-light"
    : "usa-icon--size-5 margin-left-1";
  const headerClasses = props.mini ? "" : "margin-top-3 tablet:margin-left-3";
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
    <div
      data-testid={`section-${sectionName}`}
      className="border-2px radius-lg border-cool-lighter overflow-hidden margin-bottom-4"
    >
      <SectionAccordionContext.Provider value={{ isOpen }}>
        <Accordion expanded={isOpen} onChange={handleAccordionStateChange}>
          <AccordionSummary
            expandIcon={<Icon className={dropdownIconClasses} iconName="expand_more" />}
            aria-controls={`${sectionName}-content`}
            id={`${sectionName}-header`}
            data-testid={`${sectionName}-header`}
            sx={{ position: "relative" }}
            className="padding-3"
          >
            <div className="flex flex-column width-full">
              <Heading
                level={3}
                className={`flex flex-align-center margin-0-override ${headerClasses}`}
              >
                <div className="inline">{Config.sectionHeaders[props.sectionType]}</div>
              </Heading>
              {props.progressPercentage !== undefined && (
                <div className="section-progress-bar-row">
                  <ProgressBar
                    percentage={props.progressPercentage}
                    data-testid="section-progress-bar"
                  />
                </div>
              )}
            </div>
            {props.progressPercentage !== undefined && (
              <span
                className={`section-progress-bar-label section-progress-bar-label--${progressLabelStage(props.progressPercentage)}`}
              >
                {props.progressPercentage}%
              </span>
            )}
          </AccordionSummary>
          <AccordionDetails>
            <div className="padding-x-3 padding-bottom-3">{props.children}</div>
          </AccordionDetails>
        </Accordion>
      </SectionAccordionContext.Provider>
    </div>
  );
};

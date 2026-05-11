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

interface SectionAccordionCardProps {
  sectionType: SectionType;
  children: ReactNode;
  isDividerDisabled?: boolean;
  progressPercentage?: number;
}

type ProgressLabelStage = "zero" | "low" | "mid" | "high";

const PROGRESS_STAGE_LOW_THRESHOLD = 50;
const PROGRESS_STAGE_MID_THRESHOLD = 90;

const progressLabelStage = (percentage: number): ProgressLabelStage => {
  if (percentage === 0) return "zero";
  if (percentage < PROGRESS_STAGE_LOW_THRESHOLD) return "low";
  if (percentage < PROGRESS_STAGE_MID_THRESHOLD) return "mid";
  return "high";
};

export const SectionAccordionCard = (props: SectionAccordionCardProps): ReactElement => {
  const { updateQueue, business } = useUserData();
  const dropdownIconClasses = "usa-icon--size-5 margin-left-1";
  const headerClasses = "margin-top-3 tablet:margin-left-3";
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
      className="border-2px radius-lg border-cool-lighter overflow-hidden margin-y-4"
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
                    label={`${Config.sectionHeaders[props.sectionType]} section task progress`}
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

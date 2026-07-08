import { LockedTasksPrompt } from "@/components/dashboard/LockedTasksPrompt";
import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { MiniRoadmapTask } from "@/components/roadmap/MiniRoadmapTask";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement, useContext } from "react";

interface Props {
  activeTaskId?: string | undefined;
  onTaskClick?: () => void;
}

export const MiniRoadmap = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const { Config } = useConfig();
  const { isAuthenticated } = useContext(NeedsAccountContext);

  const dropdownIconClasses = "usa-icon--size-5 text-base-light";

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<Icon className={dropdownIconClasses} iconName="expand_more" />}
        >
          <Heading level={3} className="flex flex-align-center margin-0-override">
            {Config.dashboardRoadmapHeaderDefaults.roadmapTasksHeaderAbbreviatedText}
          </Heading>
        </AccordionSummary>
        <AccordionDetails>
          {roadmap?.tasks
            .filter((task) => task.required)
            .map((task) => {
              return (
                <div key={task.id} className="margin-y-1">
                  <MiniRoadmapTask
                    task={task}
                    active={task.id === props.activeTaskId}
                    onTaskClick={props.onTaskClick}
                  />
                </div>
              );
            })}
          {isAuthenticated && <LockedTasksPrompt isCTAButtonHidden />}
        </AccordionDetails>
      </Accordion>
    </>
  );
};

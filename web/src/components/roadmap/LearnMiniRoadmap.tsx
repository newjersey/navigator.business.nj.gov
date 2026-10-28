import { Heading } from "@/components/njwds-extended/Heading";
import { LearnMiniRoadmapTask } from "@/components/roadmap/LearnMiniRoadmapTask";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { ReactElement } from "react";

interface Props {
  activeTaskId?: string | undefined;
  onTaskClick?: () => void;
  hideHeader?: boolean;
}

export const LearnMiniRoadmap = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const learnSteps = Config.learnPages.steps;

  return (
    <>
      {!props.hideHeader && (
        <Heading level={3} className="flex flex-align-center margin-0-override padding-bottom-1">
          {Config.learnPages.stepsHeader}
        </Heading>
      )}

      <div className="learn-mini-roadmap-steps">
        {Config.learnPages.steps.map((task, index) => {
          return (
            <div key={task.id} className="learn-mini-roadmap-step padding-y-05">
              <LearnMiniRoadmapTask
                task={task}
                active={task.id === props.activeTaskId}
                onTaskClick={() => {
                  props.onTaskClick?.();
                  analytics.event.learn_page.click.side_nav_click(
                    learnSteps.findIndex((t) => t.id === props.activeTaskId) + 1,
                    learnSteps.findIndex((t) => t.id === task.id) + 1,
                    task.name,
                  );
                }}
                stepNumber={index + 1}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

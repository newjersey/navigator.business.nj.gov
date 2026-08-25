import { Heading } from "@/components/njwds-extended/Heading";
import { LearnMiniRoadmapTask } from "@/components/roadmap/LearnMiniRoadmapTask";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  activeTaskId?: string | undefined;
  onTaskClick?: () => void;
}

export const LearnMiniRoadmap = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <>
      <Heading level={3} className="flex flex-align-center margin-0-override padding-bottom-1">
        {Config.learnPages.stepsHeader}
      </Heading>

      <div className="learn-mini-roadmap-steps">
        {Config.learnPages.steps.map((task, index) => {
          return (
            <div key={task.id} className="learn-mini-roadmap-step padding-y-05">
              <LearnMiniRoadmapTask
                task={task}
                active={task.id === props.activeTaskId}
                onTaskClick={props.onTaskClick}
                stepNumber={index + 1}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

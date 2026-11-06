import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";
import { NumberedMiniRoadmapTask } from "@/components/roadmap/NumberedMiniRoadmapTask";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";

interface Props {
  activeTaskId?: string | undefined;
  onTaskClick?: () => void;
}

export const ReadyMiniRoadmap = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { roadmap } = useRoadmap();
  const readySteps = roadmap?.tasks ?? [];

  return (
    <>
      <Heading level={3} className="flex flex-align-center margin-0-override padding-bottom-1">
        {Config.learnPages.stepsHeader}
      </Heading>

      <div className="learn-mini-roadmap-steps">
        {readySteps.map((task, index) => {
          return (
            <div key={task.id} className="learn-mini-roadmap-step padding-y-05">
              <NumberedMiniRoadmapTask
                task={task}
                active={task.id === props.activeTaskId}
                onTaskClick={() => {
                  props.onTaskClick?.();
                }}
                stepNumber={index + 1}
                pathPrefix={"tasks"}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

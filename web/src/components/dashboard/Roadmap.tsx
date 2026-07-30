import { LockedTasksPrompt } from "@/components/dashboard/LockedTasksPrompt";
import { ProgressBar } from "@/components/ProgressBar";
import { Task } from "@/components/Task";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ReactElement, useContext } from "react";

export const Roadmap = (): ReactElement => {
  const { roadmap } = useRoadmap();
  const { business } = useUserData();
  const { Config } = useConfig();
  const { isAuthenticated } = useContext(NeedsAccountContext);

  const isCompleted = (task: { id: string; required?: boolean }): boolean =>
    !!task.required && business?.taskProgress[task.id] === "COMPLETED";

  const completedCount = roadmap?.tasks.filter(isCompleted).length ?? 0;
  const totalCount = roadmap?.tasks.filter((task) => task.required).length ?? 0;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  type ProgressLabelStage = "zero" | "low" | "mid" | "high";

  const PROGRESS_STAGE_LOW_THRESHOLD = 50;
  const PROGRESS_STAGE_MID_THRESHOLD = 90;

  const progressLabelStage = (percentage: number): ProgressLabelStage => {
    if (percentage === 0) return "zero";
    if (percentage < PROGRESS_STAGE_LOW_THRESHOLD) return "low";
    if (percentage < PROGRESS_STAGE_MID_THRESHOLD) return "mid";
    return "high";
  };

  return (
    <>
      <div className="section-progress-bar-row margin-y-2 flex">
        <ProgressBar
          label={`Task progress`}
          percentage={percentage}
          data-testid="section-progress-bar"
        />

        <div
          className={`margin-left-2 section-progress-bar-label section-progress-bar-label--${progressLabelStage(percentage)}`}
        >
          {percentage}%
        </div>
      </div>

      <p className="margin-bottom-3">
        {Config.dashboardRoadmapHeaderDefaults.roadmapTasksDescription}
      </p>

      <ul className="usa-list usa-list--unstyled margin-bottom-8">
        {roadmap?.tasks
          .filter((task) => task.required)
          .map((task) => {
            return <Task key={task.id} task={task} showCheckbox showRequiredLabel={false} />;
          })}
      </ul>

      {isAuthenticated === "FALSE" && <LockedTasksPrompt />}
    </>
  );
};

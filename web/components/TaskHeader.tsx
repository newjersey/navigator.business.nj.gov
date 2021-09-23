import { TaskProgressDropdown } from "@/components/TaskProgressDropdown";
import React, { ReactElement } from "react";
import { Task, TaskProgress } from "@/lib/types/types";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import { Icon } from "@/components/njwds/Icon";
import { ArrowTooltip } from "@/components/ArrowTooltip";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { getModifiedTaskContent } from "@/lib/utils/helpers";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";

interface Props {
  task: Task;
  tooltipText?: string;
}

export const TaskHeader = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const { roadmap } = useRoadmap();

  const updateTaskProgress = (newValue: TaskProgress): void => {
    if (!userData) return;
    update({
      ...userData,
      taskProgress: { ...userData?.taskProgress, [props.task.id]: newValue },
    });
  };

  const renderProgress = (): ReactElement => {
    let currentTaskProgress: TaskProgress = "NOT_STARTED";
    if (userData?.taskProgress && userData.taskProgress[props.task.id]) {
      currentTaskProgress = userData.taskProgress[props.task.id];
    }

    if (props.tooltipText) {
      return (
        <div className="fdr">
          {TaskProgressTagLookup[currentTaskProgress]}
          <ArrowTooltip title={props.tooltipText}>
            <div className="fdr fac margin-left-05" data-testid="automatic-status-info-tooltip">
              <Icon>help_outline</Icon>
            </div>
          </ArrowTooltip>
        </div>
      );
    } else {
      return <TaskProgressDropdown onSelect={updateTaskProgress} initialValue={currentTaskProgress} />;
    }
  };

  return (
    <>
      <h2 className="margin-top-0 margin-bottom-2" data-task-id={props.task.id}>
        {getModifiedTaskContent(roadmap, props.task, "name")}
      </h2>
      <div className="margin-top-0 margin-bottom-2">{renderProgress()}</div>
      <UserDataErrorAlert />
    </>
  );
};

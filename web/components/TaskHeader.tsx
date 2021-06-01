import { TaskProgressDropdown } from "@/components/TaskProgressDropdown";
import React, { ReactElement } from "react";
import { Task, TaskProgress } from "@/lib/types/types";
import { useUserData } from "@/lib/data-hooks/useUserData";

interface Props {
  task: Task;
}

export const TaskHeader = (props: Props): ReactElement => {
  const { userData, update } = useUserData();

  const updateTaskProgress = (newValue: TaskProgress): void => {
    if (!userData) return;
    update({
      ...userData,
      taskProgress: { ...userData?.taskProgress, [props.task.id]: newValue },
    });
  };

  return (
    <div className="grid-container padding-0 margin-bottom-2">
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col-9">
          <h2 className="margin-top-0 margin-bottom-0" data-task-id={props.task.id}>
            {props.task.name}
          </h2>
        </div>
        <div className="tablet:grid-col-3">
          <TaskProgressDropdown
            onSelect={updateTaskProgress}
            initialValue={userData?.taskProgress ? userData.taskProgress[props.task.id] : undefined}
          />
        </div>
      </div>
    </div>
  );
};

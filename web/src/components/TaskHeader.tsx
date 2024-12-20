import { Content } from "@/components/Content";
import { TaskProgressCheckbox } from "@/components/TaskProgressCheckbox";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { getModifiedTaskBooleanUndefined, getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import { TaskProgress, isFormationTask } from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

interface Props {
  task: Task;
  tooltipText?: string;
}

export const TaskHeader = (props: Props): ReactElement<any> => {
  const { business } = useUserData();
  const { roadmap } = useRoadmap();

  const currentTaskProgress: TaskProgress = business?.taskProgress[props.task.id] ?? "NOT_STARTED";

  const { Config } = useConfig();

  const hasCompletedAPIFormation = (): boolean => {
    return business?.formationData.getFilingResponse?.success === true;
  };

  const getDisabledText = (): string | undefined => {
    if (isFormationTask(props.task.id) && hasCompletedAPIFormation()) {
      return Config.formationDateModal.lockedStatusTooltipText;
    }

    return props.tooltipText;
  };

  const getTextColorClass = (): string => {
    switch (currentTaskProgress) {
      case "NOT_STARTED":
        return "text-base-dark";
      case "IN_PROGRESS":
        return "text-accent-cooler-dark";
      case "COMPLETED":
        return "text-primary";
    }
  };

  const getBgColorClass = (): string => {
    switch (currentTaskProgress) {
      case "NOT_STARTED":
        return "bg-base-extra-light";
      case "IN_PROGRESS":
        return "bg-accent-cool-lightest";
      case "COMPLETED":
        return "bg-primary-extra-light";
    }
  };

  return (
    <>
      <div
        className={`${getBgColorClass()} margin-x-neg-4 margin-top-neg-4 padding-x-4 padding-bottom-2 padding-top-4 margin-bottom-2 radius-top-lg`}
      >
        <div
          className="flex flex-align-center flex-wrap margin-top-0 margin-bottom-2"
          data-testid="taskProgress"
        >
          <div className="margin-right-105 margin-bottom-1">
            <TaskProgressCheckbox taskId={props.task.id} disabledTooltipText={getDisabledText()} />
          </div>
          {getModifiedTaskBooleanUndefined(roadmap, props.task, "required") === true && (
            <span className={`${getTextColorClass()} display-inline-block margin-bottom-1`}>
              <Content>{Config.taskDefaults.requiredLabelText}</Content>
            </span>
          )}
        </div>
        <h1 data-task-id={props.task.id}>{getModifiedTaskContent(roadmap, props.task, "name")}</h1>
      </div>

      <UserDataErrorAlert />
    </>
  );
};

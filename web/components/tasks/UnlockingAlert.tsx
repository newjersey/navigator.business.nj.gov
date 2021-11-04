import React, { ReactElement } from "react";
import { Alert, AlertVariant } from "@/components/njwds/Alert";
import { TaskLink } from "@/lib/types/types";
import { TaskDefaults } from "@/display-defaults/tasks/TaskDefaults";

interface Props {
  taskLinks: TaskLink[];
  variant: AlertVariant;
  isLoading: boolean;
  singularText: string;
  pluralText: string;
  className?: string;
}

export const UnlockingAlert = (props: Props): ReactElement => {
  if (props.taskLinks.length === 0 && !props.isLoading) return <></>;

  return (
    <div className={props.className}>
      <Alert variant={props.variant} slim>
        {props.isLoading ? (
          <>{TaskDefaults.loadingTaskDependencies}</>
        ) : (
          <>
            {props.taskLinks.length === 1 ? props.singularText : props.pluralText}{" "}
            {props.taskLinks.map((taskLink, index) => (
              <span key={taskLink.urlSlug}>
                <a href={taskLink.urlSlug}>{taskLink.name}</a>
                {index != props.taskLinks.length - 1 ? ", " : ""}
              </span>
            ))}
          </>
        )}
      </Alert>
    </div>
  );
};

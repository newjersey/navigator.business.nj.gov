import { Alert, AlertVariant } from "@/components/njwds/Alert";
import { TaskDefaults } from "@/display-defaults/tasks/TaskDefaults";
import { TaskLink } from "@/lib/types/types";
import React, { ReactElement } from "react";

interface Props {
  taskLinks: TaskLink[];
  variant: AlertVariant;
  isLoading: boolean;
  singularText: string;
  pluralText: string;
  className?: string;
  dataTestid?: string;
}

export const UnlockingAlert = (props: Props): ReactElement => {
  if (props.taskLinks.length === 0 && !props.isLoading) return <></>;

  return (
    <div className={props.className} data-testid={props.dataTestid}>
      <Alert variant={props.variant} slim>
        {props.isLoading ? (
          <>{TaskDefaults.loadingTaskDependencies}</>
        ) : (
          <>
            {props.taskLinks.length === 1 ? props.singularText : props.pluralText}{" "}
            {props.taskLinks.map((taskLink, index) => (
              <span key={taskLink.urlSlug}>
                <a className="usa-link" href={taskLink.urlSlug}>
                  {taskLink.name}
                </a>
                {index != props.taskLinks.length - 1 ? ", " : ""}
              </span>
            ))}
          </>
        )}
      </Alert>
    </div>
  );
};

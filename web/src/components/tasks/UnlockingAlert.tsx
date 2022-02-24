import { Alert, AlertVariant } from "@/components/njwds-extended/Alert";
import { TaskLink } from "@/lib/types/types";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
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
    <div className={props.className}>
      <Alert variant={props.variant} dataTestid={props.dataTestid}>
        {props.isLoading ? (
          <>{Defaults.taskDefaults.loadingTaskDependencies}</>
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

import { Alert, AlertVariant } from "@/components/njwds-extended/Alert";
import { TaskLink } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

interface Props {
  readonly taskLinks: readonly TaskLink[];
  readonly variant: AlertVariant;
  readonly isLoading: boolean;
  readonly singularText: string;
  readonly pluralText: string;
  readonly className?: string;
  readonly dataTestid?: string;
}

export const UnlockingAlert = (props: Props): ReactElement => {
  if (props.taskLinks.length === 0 && !props.isLoading) return <></>;

  return (
    <div className={props.className}>
      <Alert variant={props.variant} dataTestid={props.dataTestid}>
        {props.isLoading ? (
          <>{Config.taskDefaults.loadingTaskDependencies}</>
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

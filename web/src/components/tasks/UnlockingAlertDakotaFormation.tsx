import { Alert, AlertVariant } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { TaskLink } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  taskLinks: TaskLink[];
  variant: AlertVariant;
  isLoading: boolean;
  className?: string;
  dataTestid?: string;
}

export const UnlockingAlertDakotaFormation = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  if (props.taskLinks.length === 0 && !props.isLoading) {
    return <></>;
  }

  return (
    <div className={props.className}>
      <Alert variant={props.variant} dataTestid={props.dataTestid}>
        {props.isLoading ? (
          <>{Config.taskDefaults.loadingTaskDependencies}</>
        ) : (
          <>
            {Config.formation.intro.certificateOfGoodStandingAlert.beginning}{" "}
            {props.taskLinks.map((taskLink, index) => {
              return (
                <span key={taskLink.urlSlug}>
                  <a className="usa-link" href={taskLink.urlSlug}>
                    {taskLink.name}
                  </a>
                  {index === props.taskLinks.length - 1 ? "" : ", "}
                </span>
              );
            })}
            {". "}
            {Config.formation.intro.certificateOfGoodStandingAlert.end}
          </>
        )}
      </Alert>
    </div>
  );
};

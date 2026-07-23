import { Content } from "@/components/Content";
import { taskIdsWithLicenseSearchEnabled } from "@/components/TaskPageSwitchComponent";
import { TaskProgressCheckbox } from "@/components/TaskProgressCheckbox";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import * as types from "@businessnjgovnavigator/shared/types";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import { ReactElement, ReactNode } from "react";

interface Props {
  task: types.Task;
  showCheckbox?: boolean;
  showRequiredLabel?: boolean;
}

export const Task = (props: Props): ReactElement => {
  const { business } = useUserData();
  const { Config } = useConfig();
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const taskProgress = (business?.taskProgress && business.taskProgress[props.task.id]) || "TO_DO";

  const renderRequiredLabel = (): ReactNode => {
    if (!props.task.required || !props.showRequiredLabel) {
      return <></>;
    }
    return (
      <span
        className="text-base text-no-underline display-inline-block margin-left-105"
        data-testid="required task"
      >
        <Content>{Config.taskDefaults.requiredLabelText}</Content>
      </span>
    );
  };

  const getDisabledTooltipText = (taskId: string, taskProgress: string): string => {
    // Block users from checking off the business structure task without completing it
    // since the formation task changes depending on business structure
    if (taskId === "business-structure") {
      if (taskProgress === "COMPLETED") {
        return Config.businessStructureTask.completedRoadmapTooltip;
      } else {
        return Config.businessStructureTask.uncompletedRoadmapTooltip;
      }
    }

    return "";
  };

  return (
    <li className="margin-0">
      <div
        className={`line-height-sans-2 flex flex-align-start ${
          isTabletAndUp ? "margin-bottom-2" : "margin-bottom-1"
        }`}
      >
        <span className="margin-right-205 margin-top-05 padding-top-2px">
          {props.showCheckbox ? (
            <TaskProgressCheckbox
              taskId={props.task.id}
              disabledTooltipText={getDisabledTooltipText(props.task.id, taskProgress)}
              hideTaskProgressTag={!isTabletAndUp}
            />
          ) : (
            TaskProgressTagLookup[taskProgress]
          )}
        </span>
        <Link
          href={`/tasks/${props.task.urlSlug}`}
          passHref
          onClick={(): void =>
            analytics.event.roadmap_task_title.click.go_to_task(props.task.urlSlug)
          }
          className={`usa-link margin-right-105 line-height-sans-5 ${props.task.required ? "text-bold" : ""}`}
          data-task={props.task.id}
          data-testid={props.task.id}
        >
          {props.task.name}
        </Link>{" "}
        {isTabletAndUp && renderRequiredLabel()}
        {(props.task.needsAccount || taskIdsWithLicenseSearchEnabled.includes(props.task.id)) && (
          <img
            className="usa-icon display-inline-block margin-left-auto"
            style={{ transform: "translateY(5px)" }}
            src="/img/lock.svg"
            alt="Requires account"
          />
        )}
      </div>
    </li>
  );
};

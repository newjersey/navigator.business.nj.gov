import { Content } from "@/components/Content";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import * as types from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import { ReactElement, ReactNode } from "react";

interface Props {
  task: types.Task;
}

export const Task = (props: Props): ReactElement => {
  const { business } = useUserData();
  const { Config } = useConfig();
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const taskProgress = (business?.taskProgress && business.taskProgress[props.task.id]) || "NOT_STARTED";

  const renderRequiredLabel = (): ReactNode => {
    if (!props.task.required) {
      return <></>;
    }
    return (
      <span className="text-base text-no-underline display-inline-block" data-testid="required task">
        <Content>{Config.taskDefaults.requiredLabelText}</Content>
      </span>
    );
  };

  return (
    <li className="margin-0">
      <div
        className={`line-height-sans-2 flex flex-align-start ${
          isTabletAndUp ? "margin-bottom-2" : "margin-bottom-1"
        }`}
      >
        {isTabletAndUp && (
          <span className="margin-right-205 margin-top-05 padding-top-2px">
            {TaskProgressTagLookup[taskProgress]}
          </span>
        )}
        <div>
          <Link
            href={`/tasks/${props.task.urlSlug}`}
            onClick={(): void => analytics.event.roadmap_task_title.click.go_to_task(props.task.urlSlug)}
            className={`usa-link margin-right-105 ${props.task.required ? "text-bold" : ""}`}
            data-task={props.task.id}
            data-testid={props.task.id}
          >
            {props.task.name}
          </Link>

          {isTabletAndUp && renderRequiredLabel()}
        </div>
      </div>

      {!isTabletAndUp && (
        <div className="margin-bottom-2">
          {TaskProgressTagLookup[taskProgress]} <span className="margin-left-1">{renderRequiredLabel()}</span>
        </div>
      )}
    </li>
  );
};

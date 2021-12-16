import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import * as types from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import React, { ReactElement } from "react";

interface Props {
  task: types.Task;
}

export const Task = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const taskProgress = (userData?.taskProgress && userData.taskProgress[props.task.id]) || "NOT_STARTED";

  return (
    <li className="margin-0">
      <div className={`line-height-sans-2 flex ${isTabletAndUp ? "margin-bottom-2" : "margin-bottom-1"}`}>
        {isTabletAndUp && <span className="margin-right-205">{TaskProgressTagLookup[taskProgress]}</span>}
        <Link href={`/tasks/${props.task.urlSlug}`} passHref>
          <a
            onClick={() => analytics.event.roadmap_task_title.click.go_to_task()}
            href={`/tasks/${props.task.urlSlug}`}
            className="usa-link"
            data-task={props.task.id}
          >
            {props.task.name}
          </a>
        </Link>
      </div>
      {!isTabletAndUp && <div className="margin-bottom-2">{TaskProgressTagLookup[taskProgress]}</div>}
    </li>
  );
};

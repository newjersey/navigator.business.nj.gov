import Link from "next/link";
import React, { ReactElement } from "react";
import * as types from "@/lib/types/types";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import analytics from "@/lib/utils/analytics";
import { useMediaQuery } from "@mui/material";
import { MediaQueries } from "@/lib/PageSizes";

interface Props {
  task: types.Task;
}

export const Task = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const isTabletScreen = useMediaQuery(MediaQueries.tabletAndUp);

  const taskProgress = (userData?.taskProgress && userData.taskProgress[props.task.id]) || "NOT_STARTED";

  return (
    <li className="margin-0">
      <div className={`line-height-sans-2 flex ${isTabletScreen ? "margin-bottom-2" : "margin-bottom-1"}`}>
        {isTabletScreen && <span className="margin-right-205">{TaskProgressTagLookup[taskProgress]}</span>}
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
      {!isTabletScreen && <div className="margin-bottom-2">{TaskProgressTagLookup[taskProgress]}</div>}
    </li>
  );
};

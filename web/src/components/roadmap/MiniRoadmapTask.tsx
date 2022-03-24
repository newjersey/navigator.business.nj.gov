import { Icon } from "@/components/njwds/Icon";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import Link from "next/link";
import React, { ReactElement } from "react";

interface Props {
  task: Task;
  active: boolean;
  onTaskClick?: () => void;
}

export const MiniRoadmapTask = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const taskProgress = (userData?.taskProgress && userData.taskProgress[props.task.id]) || "NOT_STARTED";

  return (
    <Link href={`/tasks/${props.task.urlSlug}`} passHref>
      <button
        className={`usa-button--unstyled padding-y-1 padding-left-1 padding-right-4 cursor-pointer hover:bg-base-lightest line-height-body-2 fdr fac font-body-3xs text-ink ${
          props.active ? "bg-base-lightest bg-chevron text-primary-dark text-bold" : ""
        }`}
        data-task={props.task.id}
        onClick={() => {
          analytics.event.task_mini_roadmap_task.click.go_to_task;
          props.onTaskClick && props.onTaskClick();
        }}
      >
        {taskProgress === "COMPLETED" ? (
          <Icon className="margin-right-1 font-body-md checked-task">check_circle</Icon>
        ) : (
          <div className={`substep-unchecked margin-right-1 ${props.active ? "active" : ""}`} />
        )}
        <span className="margin-right-05">{props.task.name}</span>
      </button>
    </Link>
  );
};

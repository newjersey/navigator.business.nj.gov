import React, { ReactElement } from "react";
import Link from "next/link";
import { Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";

interface Props {
  task: Task;
  active: boolean;
}

export const MiniRoadmapTask = (props: Props): ReactElement => {
  return (
    <Link href={`/tasks/${props.task.urlSlug}`} passHref>
      <button
        className={`usa-button--unstyled width-100 padding-1 cursor-pointer hover:bg-base-lightest line-height-body-2 fdr fac font-body-3xs text-ink ${
          props.active ? "bg-base-lightest bg-chevron text-primary-dark text-bold" : ""
        }`}
        data-task={props.task.id}
        onClick={analytics.event.task_mini_roadmap_task.click.go_to_task}
      >
        <div className={`substep-unchecked margin-right-1 ${props.active ? "active" : ""}`} />
        {props.task.name}
      </button>
    </Link>
  );
};

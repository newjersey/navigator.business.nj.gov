import Link from "next/link";
import React, { ReactElement } from "react";
import * as types from "../lib/types/types";
import { useUserData } from "../lib/data-hooks/useUserData";
import { TaskProgressTagLookup } from "./TaskProgressTagLookup";

interface Props {
  task: types.Task;
}

export const Task = (props: Props): ReactElement => {
  const { userData } = useUserData();

  const taskProgress = (userData?.taskProgress && userData.taskProgress[props.task.id]) || "NOT_STARTED";

  return (
    <li>
      <Link href={`/tasks/${props.task.id}`} passHref>
        <a href={`/tasks/${props.task.id}`} className="usa-link" data-task={props.task.id}>
          {props.task.name}
        </a>
      </Link>
      <span className="margin-left-1">{TaskProgressTagLookup[taskProgress]}</span>
    </li>
  );
};

import Link from "next/link";
import React, { ReactElement } from "react";
import * as types from "../lib/types/types";

interface Props {
  task: types.Task;
}

export const Task = (props: Props): ReactElement => {
  return (
    <li>
      <Link href={`/tasks/${props.task.id}`} passHref>
        <a href={`/tasks/${props.task.id}`} className="usa-link">
          <h4 data-task={props.task.id}>{props.task.name}</h4>
        </a>
      </Link>
    </li>
  );
};

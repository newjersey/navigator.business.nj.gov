import React, { ReactElement } from "react";
import { TasksEntity } from "../lib/types/Roadmap";

interface Props {
  task: TasksEntity;
}

export const Task = (props: Props): ReactElement => {
  return (
    <>
      <h4>{props.task.name}</h4>
      <p>{props.task.description}</p>
    </>
  );
};

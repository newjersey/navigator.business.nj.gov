import { StepsEntity } from "../lib/types/roadmaps";
import React, { ReactElement } from "react";
import { Task } from "./Task";

interface Props {
  step: StepsEntity;
}

export const Step = (props: Props): ReactElement => {
  return (
    <>
      <h1>
        {props.step.step_number} - {props.step.name}
      </h1>
      <p>{props.step.description}</p>
      {props.step.tasks.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </>
  );
};

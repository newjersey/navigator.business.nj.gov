import React, { ReactElement } from "react";
import { TasksEntity } from "../lib/types/Roadmap";

interface Props {
  task: TasksEntity;
}

export const Task = (props: Props): ReactElement => {
  if (props.task.id === "form_business_entity") {
    return (
      <>
        <a className="usa-link" href="/tasks/form_business_entity">
          <h4>{props.task.name}</h4>
        </a>
        <p>{props.task.description}</p>
      </>
    );
  }

  return (
    <>
      <h4>{props.task.name}</h4>
      <p>{props.task.description}</p>
    </>
  );
};

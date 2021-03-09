import React, { ReactElement } from "react";
import { Task } from "./Task";
import { StepsEntity } from "../lib/types/Roadmap";
import { VerticalStepIndicator } from "./njwds-extended/VerticalStepIndicator";

interface Props {
  step: StepsEntity;
  last: boolean;
}

export const Step = (props: Props): ReactElement => {
  return (
    <div className="grid-row margin-top-2">
      <div className="tablet:grid-col-3 margin-right-4">
        <div className="fdr usa-prose">
          <VerticalStepIndicator number={props.step.step_number} last={props.last} />
          <div className="step-label">
            <h2 className="margin-top-0 text-reg text-bold">{props.step.name}</h2>
            <div className="text-sm text-base-light">{props.step.timeEstimate}</div>
          </div>
        </div>
      </div>

      <div className="tablet:grid-col-8 roadmap-content">
        <p className="margin-top-2">{props.step.description}</p>
        <ul>
          {props.step.tasks.map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </ul>
      </div>
    </div>
  );
};

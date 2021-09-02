import React, { ReactElement } from "react";
import { Task } from "@/components/Task";
import * as types from "@/lib/types/types";
import { VerticalStepIndicator } from "@/components/njwds-extended/VerticalStepIndicator";
import { isStepCompleted } from "@/lib/utils/helpers";
import { useUserData } from "@/lib/data-hooks/useUserData";

interface Props {
  step: types.Step;
  last: boolean;
}

export const Step = (props: Props): ReactElement => {
  const { userData } = useUserData();

  return (
    <div className="grid-row margin-top-3" id={`vertical-content-${props.step.step_number}`}>
      <div className="tablet:grid-col-3 margin-right-4">
        <div className="fdr">
          <div className="margin-top-2">
            <VerticalStepIndicator
              number={props.step.step_number}
              last={props.last}
              completed={isStepCompleted(props.step, userData)}
            />
          </div>
          <div className="step-label">
            <h2
              className="margin-0 font-sans-sm line-height-body-5 weight-unset"
              data-step={props.step.step_number}
            >
              {props.step.name}
            </h2>
            <div className="font-sans-3xs text-base-dark">{props.step.timeEstimate}</div>
          </div>
        </div>
      </div>

      <div className="tablet:grid-col-8 roadmap-content">
        <p>{props.step.description}</p>
        <ul>
          {props.step.tasks.map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </ul>
      </div>
    </div>
  );
};

import { VerticalStepIndicator } from "@/components/njwds-extended/VerticalStepIndicator";
import { Task } from "@/components/Task";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import * as types from "@/lib/types/types";
import { isStepCompleted } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  step: types.Step;
  last: boolean;
}

export const Step = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const { roadmap } = useRoadmap();
  return (
    <div
      className={`grid-row margin-top-3 tablet:margin-left-3 padding-left-2px ${
        props.last ? "margin-bottom-1" : ""
      }`}
      id={`vertical-content-${props.step.stepNumber}`}
    >
      <div className="tablet:grid-col-3 margin-right-4">
        <div className="flex flex-row">
          <div className="margin-top-2">
            <VerticalStepIndicator
              stepNumber={props.step.stepNumber}
              last={props.last}
              completed={isStepCompleted(roadmap, props.step, userData)}
            />
          </div>
          <div className="step-label">
            <h3
              className="margin-0 font-sans-sm line-height-body-5 weight-unset h4-styling"
              data-step={props.step.stepNumber}
            >
              {props.step.name}
            </h3>
            <div className="font-sans-3xs text-base-dark">{props.step.timeEstimate}</div>
          </div>
        </div>
      </div>

      <div className="tablet:grid-col-8 roadmap-content">
        <p className="margin-bottom-205">{props.step.description}</p>
        <ul className="usa-list usa-list--unstyled">
          {roadmap?.tasks
            .filter((task) => task.stepNumber == props.step.stepNumber)
            .map((task) => (
              <Task key={task.id} task={task} />
            ))}
        </ul>
      </div>
    </div>
  );
};

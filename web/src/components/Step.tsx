import { Task } from "@/components/Task";
import { VerticalStepIndicator } from "@/components/njwds-extended/VerticalStepIndicator";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isStepCompleted } from "@/lib/domain-logic/isStepCompleted";
import * as types from "@/lib/types/types";
import { ReactElement } from "react";
import { ModifiedContent } from "./ModifiedContent";

interface Props {
  step: types.Step;
  last: boolean;
}

export const Step = (props: Props): ReactElement<any> => {
  const { business } = useUserData();
  const { roadmap } = useRoadmap();
  return (
    <div
      className={`margin-top-3 ${props.last ? "margin-bottom-1" : "padding-bottom-105"}`}
      id={`vertical-content-${props.step.stepNumber}`}
    >
      <div className="tablet:margin-right-4 minh-4">
        <div className="flex flex-row">
          <VerticalStepIndicator
            stepNumber={props.step.stepNumber}
            last={props.last}
            completed={isStepCompleted(roadmap, props.step, business)}
          />

          <div className="margin-left-6 margin-top-neg-2px tablet:margin-left-205 font-body-md margin-bottom-105">
            <div className="tablet:margin-left-4">
              <span
                role="heading"
                aria-level={4}
                className="text-bold margin-right-1"
                data-step={props.step.stepNumber}
              >
                <ModifiedContent>{props.step.name}</ModifiedContent>
              </span>
              {props.step.timeEstimate && <span className="text-base">({props.step.timeEstimate})</span>}
            </div>
          </div>
        </div>

        <div className="tablet:margin-left-6 padding-left-05">
          <p className="margin-bottom-205">{props.step.description}</p>
          <ul className="usa-list usa-list--unstyled">
            {roadmap?.tasks
              .filter((task) => {
                return task.stepNumber === props.step.stepNumber;
              })
              .map((task) => {
                return <Task key={task.id} task={task} />;
              })}
          </ul>
        </div>
      </div>
    </div>
  );
};

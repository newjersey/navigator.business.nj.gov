import { VerticalStepIndicator } from "@/components/njwds-extended/VerticalStepIndicator";
import { Task } from "@/components/Task";
import { useContentModifiedByUserData } from "@/lib/data-hooks/useContentModifiedByUserData";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isStepCompleted } from "@/lib/domain-logic/isStepCompleted";
import * as types from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  step: types.Step;
  last: boolean;
}

export const Step = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const { roadmap } = useRoadmap();
  const stepName = useContentModifiedByUserData(props.step.name ?? "");
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
            completed={isStepCompleted(roadmap, props.step, userData)}
          />

          <div className="margin-left-6 margin-top-neg-2px tablet:margin-left-205 font-body-md margin-bottom-105">
            <span
              role="heading"
              aria-level={3}
              className="text-bold margin-right-1 tablet:margin-left-4"
              data-step={props.step.stepNumber}
            >
              {stepName}
            </span>
            <span className="text-base">({props.step.timeEstimate})</span>
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

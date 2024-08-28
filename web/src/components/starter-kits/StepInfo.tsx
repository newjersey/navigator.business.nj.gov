import { Heading } from "@/components/njwds-extended/Heading";
import { Step } from "@/lib/types/types";
import { ReactElement } from "react";

export const StepInfo = (props: { step: Step; taskNames: string[] }): ReactElement => {
  return (
    <div className="flex-basis-100">
      <div className="margin-top-05 margin-bottom-2">
        <span className="border-2px border-secondary-vivid-dark text-secondary-vivid-dark radius-lg padding-x-1 padding-y-05">
          <strong>STEP {props.step.stepNumber}</strong>
        </span>
      </div>
      <Heading level={3} styleVariant="h4">
        {props.step.name.replace("${OoS}", "")}
      </Heading>
      <p>{props.step.description}</p>
      <strong className="text-base-dark">{`(${props.step.timeEstimate})`}</strong>
      <ul className="padding-left-205">
        {props.taskNames.map((taskName) => (
          <li key={taskName}>{taskName}</li>
        ))}
      </ul>
    </div>
  );
};

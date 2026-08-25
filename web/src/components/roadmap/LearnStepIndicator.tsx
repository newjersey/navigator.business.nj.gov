import { ReactElement } from "react";

interface Props {
  stepNumber: number;
  active: boolean;
}

export const LearnStepIndicator = (props: Props): ReactElement => {
  return (
    <div
      className={`learn-step-indicator ${props.active ? "learn-step-indicator--active" : ""}`}
      data-testid="learn-step-indicator"
    >
      <div className="usa-step-indicator usa-step-indicator--counters usa-step-indicator__segments">
        <div className="visually-hidden-centered">Step {props.stepNumber}</div>
        <div
          aria-hidden="true"
          className="usa-step-indicator__segment usa-step-indicator__segment-smaller"
          data-num={props.stepNumber}
        />
      </div>
    </div>
  );
};

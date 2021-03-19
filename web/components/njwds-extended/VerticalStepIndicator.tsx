import React, { ReactElement } from "react";

interface Props {
  number: number;
  last: boolean;
  active?: boolean;
  small?: boolean;
}

export const VerticalStepIndicator = (props: Props): ReactElement => {
  const sm = props.small ? "-sm" : "";

  return (
    <div className={`usa-step-indicator usa-step-indicator--counters${sm}`} aria-label="progress">
      <ol className="usa-step-indicator__segments vertical">
        <li
          className={` vertical ${
            props.last ? "no-line" : ""
          } usa-step-indicator__segment usa-step-indicator__segment--${
            props.active ? "current" : "complete"
          }`}
          data-num={props.number}
        >
          <span className="usa-step-indicator__segment-label"></span>
        </li>
      </ol>
    </div>
  );
};

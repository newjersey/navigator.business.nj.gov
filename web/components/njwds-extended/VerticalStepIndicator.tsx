import React, { ReactElement } from "react";

interface Props {
  number: number;
  last: boolean;
}

export const VerticalStepIndicator = (props: Props): ReactElement => {
  return (
    <div className="usa-step-indicator usa-step-indicator--counters" aria-label="progress">
      <ol className="usa-step-indicator__segments vertical">
        <li
          className={` vertical ${
            props.last ? "no-line" : ""
          } usa-step-indicator__segment usa-step-indicator__segment--complete`}
          data-num={props.number}
        >
          <span className="usa-step-indicator__segment-label"></span>
        </li>
      </ol>
    </div>
  );
};

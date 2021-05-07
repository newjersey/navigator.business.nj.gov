import React, { ReactElement } from "react";
import { useMountEffect, useOnWindowResize } from "@/lib/utils/helpers";

interface Props {
  number: number;
  last: boolean;
  active?: boolean;
  small?: boolean;
}

export const VerticalStepIndicator = (props: Props): ReactElement => {
  const sm = props.small ? "-sm" : "";

  const resizeVerticalBarToContent = () => {
    const content = document.getElementById(`vertical-content-${props.number}`);
    if (content) {
      const height = content.offsetHeight;
      const verticalBar = document.getElementById(`vertical-bar-${props.number}`);
      if (verticalBar) {
        verticalBar.style.height = `${height}px`;
      }
    }
  };

  useMountEffect(resizeVerticalBarToContent);
  useOnWindowResize(resizeVerticalBarToContent);

  return (
    <div className={`usa-step-indicator usa-step-indicator--counters${sm}`} aria-label="progress">
      <ol className="usa-step-indicator__segments vertical">
        <li
          className={` vertical usa-step-indicator__segment usa-step-indicator__segment--${
            props.active ? "current" : "complete"
          }`}
          data-num={props.number}
        >
          <span className="usa-step-indicator__segment-label" />
        </li>
        {!props.last && (
          <div
            className={`vertical-bar${sm} ${props.active ? "current" : "complete"}`}
            id={`vertical-bar-${props.number}`}
          />
        )}
      </ol>
    </div>
  );
};

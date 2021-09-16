import React, { ReactElement } from "react";
import { useMountEffect, useOnWindowResize } from "@/lib/utils/helpers";

interface Props {
  stepNumber: number;
  last: boolean;
  active?: boolean;
  small?: boolean;
  completed?: boolean;
  isOpen?: boolean;
}

export const VerticalStepIndicator = (props: Props): ReactElement => {
  const sm = props.small ? "-sm" : "";
  const isOpen = props.isOpen || false;

  const resizeVerticalBarToContent = () => {
    const content = document.getElementById(`vertical-content-${props.stepNumber}`);
    if (!content) return;
    const height = content.offsetHeight;

    const verticalBar = document.getElementById(`vertical-bar-${props.stepNumber}`);
    if (!verticalBar) return;

    if (props.last) {
      const marginStyle = getComputedStyle(content);
      const margin = parseInt(marginStyle.marginTop) + parseInt(marginStyle.marginBottom);
      const newHeight = height - margin;
      verticalBar.style.height = `${newHeight}px`;
    } else {
      verticalBar.style.height = `${height}px`;
    }
  };
  useMountEffect(resizeVerticalBarToContent);
  useOnWindowResize(resizeVerticalBarToContent);

  const getTrailingBar = () => {
    if (props.small && props.last && !isOpen) {
      return <></>;
    }
    return (
      <div
        className={`vertical-bar${sm} ${props.active ? "current" : "complete"}`}
        id={`vertical-bar-${props.stepNumber}`}
      />
    );
  };

  return (
    <div className={`usa-step-indicator usa-step-indicator--counters${sm}`}>
      <div className="usa-step-indicator__segments vertical">
        <div
          className={` vertical usa-step-indicator__segment usa-step-indicator__segment--${
            props.active ? "current" : "complete"
          }`}
          data-num={props.completed ? "✓" : props.stepNumber}
          aria-label={`Step ${props.stepNumber}`}
        >
          <span className="usa-step-indicator__segment-label" />
        </div>
        {getTrailingBar()}
      </div>
    </div>
  );
};

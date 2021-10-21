import React, { ReactElement, useEffect } from "react";
import { useOnWindowResize } from "@/lib/utils/helpers";

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
      const newHeight = height - parseInt(marginStyle.marginTop);
      verticalBar.style.height = `${newHeight}px`;
    } else {
      verticalBar.style.height = `${height}px`;
    }
  };

  useEffect(resizeVerticalBarToContent, [props.isOpen, props.last, props.stepNumber]);
  useOnWindowResize(resizeVerticalBarToContent);

  const getTrailingBar = () => {
    if (props.small && props.last && !isOpen) {
      return <></>;
    }
    return (
      <div
        aria-hidden="true"
        className={`vertical-bar${sm} ${props.active ? "current" : "complete"}`}
        id={`vertical-bar-${props.stepNumber}`}
      />
    );
  };

  return (
    <div
      className={`usa-step-indicator usa-step-indicator--counters${sm} usa-step-indicator__segments vertical`}
    >
      <div className="visually-hidden-centered">
        {props.completed ? `Completed step ${props.stepNumber}` : `Step ${props.stepNumber}`}
      </div>
      <div
        className={` vertical usa-step-indicator__segment usa-step-indicator__segment--${
          props.active ? "current" : "complete"
        }`}
        aria-hidden="true"
        data-num={props.completed ? "✓" : props.stepNumber}
      />
      <span className="usa-step-indicator__segment-label" />
      {getTrailingBar()}
    </div>
  );
};

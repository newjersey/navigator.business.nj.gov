import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import React, { ReactElement } from "react";

interface Props {
  arrayOfSteps: string[];
  currentStep: number;
}

export const HorizontalStepper = (props: Props): ReactElement => {
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  return (
    <>
      <div className="horizontal-step-indicator display-block">
        <div className="usa-step-indicator usa-step-indicator--counters-sm">
          <ol className="usa-step-indicator__segments">
            {props.arrayOfSteps.map((content: string, index: number) => (
              <li
                key={`${content}-${index}`}
                className={`usa-step-indicator__segment usa-step-indicator__segment${
                  index < props.currentStep ? "--complete" : index === props.currentStep ? "--current" : ""
                }`}
                aria-hidden
                data-num={index < props.currentStep ? "✓" : index + 1}
              >
                <span className="usa-step-indicator__segment-label" aria-hidden>
                  {content}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className={isTabletAndUp ? "visually-hidden-centered" : "margin-top-05 margin-bottom-2"}>
        {`Step ${props.currentStep + 1} of ${props.arrayOfSteps.length} - ${
          props.arrayOfSteps[props.currentStep]
        }`}
      </div>
    </>
  );
};

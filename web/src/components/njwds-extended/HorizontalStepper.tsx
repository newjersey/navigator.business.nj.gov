import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  steps: StepperStep[];
  currentStep: number;
}

type StepperStep = { name: string; hasError: boolean };

export const HorizontalStepper = (props: Props): ReactElement => {
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const getCSSClassColor = (index: number): string => {
    if (props.steps[index].hasError) {
      return "--error";
    }
    if (index < props.currentStep) {
      return "--complete";
    } else if (index === props.currentStep) {
      return "--current";
    } else {
      return "";
    }
  };

  const getIcon = (index: number): string => {
    if (props.steps[index].hasError) {
      return "!";
    }
    if (index < props.currentStep) {
      return "✓";
    } else {
      return `${index + 1}`;
    }
  };

  return (
    <>
      <div className="horizontal-step-indicator display-block">
        <div className="usa-step-indicator usa-step-indicator--counters-sm">
          <ol className="usa-step-indicator__segments">
            {props.steps.map((step: StepperStep, index: number) => (
              <li
                key={`${step.name}-${index}`}
                className={`usa-step-indicator__segment usa-step-indicator__segment${getCSSClassColor(
                  index
                )}`}
                aria-hidden
                data-num={getIcon(index)}
              >
                <span className="usa-step-indicator__segment-label" aria-hidden>
                  {step.name}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className={isTabletAndUp ? "visually-hidden-centered" : "margin-top-05 margin-bottom-2"}>
        {`Step ${props.currentStep + 1} of ${props.steps.length} - ${props.steps[props.currentStep].name}`}
      </div>
    </>
  );
};

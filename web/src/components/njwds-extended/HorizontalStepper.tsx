import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  steps: StepperStep[];
  currentStep: number;
  onStepClicked: (step: number) => void;
}

type StepperStep = { name: string; hasError: boolean; isComplete: boolean };
type StepperState =
  | "ERROR"
  | "ERROR-ACTIVE"
  | "COMPLETE"
  | "COMPLETE-ACTIVE"
  | "INCOMPLETE-ACTIVE"
  | "INCOMPLETE";

export const HorizontalStepper = (props: Props): ReactElement => {
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const determineState = (index: number): StepperState => {
    if (index === props.currentStep) {
      if (props.steps[index].hasError) {
        return "ERROR-ACTIVE";
      } else if (props.steps[index].isComplete) {
        return "COMPLETE-ACTIVE";
      } else {
        return "INCOMPLETE-ACTIVE";
      }
    } else {
      if (props.steps[index].hasError) {
        return "ERROR";
      } else if (props.steps[index].isComplete) {
        return "COMPLETE";
      } else {
        return "INCOMPLETE";
      }
    }
  };

  const getCSSClassColor = (index: number) => {
    const state = determineState(index);
    switch (state) {
      case "ERROR":
      case "ERROR-ACTIVE":
        return "--error";
      case "COMPLETE":
      case "COMPLETE-ACTIVE":
        return "--complete";
      case "INCOMPLETE-ACTIVE":
        return "--current";
      default:
        return "";
    }
  };

  const getIcon = (index: number): string => {
    const state = determineState(index);
    switch (state) {
      case "ERROR":
      case "ERROR-ACTIVE":
        return "!";
      case "COMPLETE":
      case "COMPLETE-ACTIVE":
        return "✓";
      default:
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
                className={`cursor-pointer usa-step-indicator__segment usa-step-indicator__segment${getCSSClassColor(
                  index
                )}`}
                aria-hidden
                data-num={getIcon(index)}
                data-state={determineState(index)}
                onClick={() => props.onStepClicked(index)}
                data-testid={`stepper-${index}`}
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

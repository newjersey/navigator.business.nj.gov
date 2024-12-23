import { useConfig } from "@/lib/data-hooks/useConfig";
import { modifyContent } from "@/lib/domain-logic/modifyContent";
import { StepperStep } from "@/lib/types/types";
import { scrollToTopOfElement } from "@/lib/utils/helpers";
import { ReactElement, useEffect, useRef, useState } from "react";

interface Props {
  steps: StepperStep[];
  currentStep: number;
  onStepClicked: (step: number) => void;
  suppressRefocusBehavior?: boolean;
}

type StepperState =
  | "ERROR"
  | "ERROR-ACTIVE"
  | "COMPLETE"
  | "COMPLETE-ACTIVE"
  | "INCOMPLETE-ACTIVE"
  | "INCOMPLETE";

export const HorizontalStepper = (props: Props): ReactElement => {
  const [focusStep, setFocusStep] = useState(props.currentStep);

  const { Config } = useConfig();

  useEffect(() => {
    setFocusStep(props.currentStep);
  }, [props.currentStep]);

  useEffect(() => {
    if (divRefs.current[props.currentStep] && !props.suppressRefocusBehavior) {
      scrollToTopOfElement(divRefs.current[props.currentStep], { focusElement: true });
    }
  }, [props.currentStep, props.suppressRefocusBehavior]);

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

  const determineAriaState = (stepperState: StepperState): string => {
    switch (stepperState) {
      case "ERROR":
        return Config.formation.general.ariaContextStepperStateError;
      case "ERROR-ACTIVE":
        return Config.formation.general.ariaContextStepperStateError;
      case "COMPLETE":
        return Config.formation.general.ariaContextStepperStateComplete;
      case "COMPLETE-ACTIVE":
        return Config.formation.general.ariaContextStepperStateComplete;
      case "INCOMPLETE-ACTIVE":
        return Config.formation.general.ariaContextStepperStateIncomplete;
      case "INCOMPLETE":
        return Config.formation.general.ariaContextStepperStateIncomplete;
      default:
        return "";
    }
  };

  const getCSSClassColor = (index: number): string => {
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

  const getBoldClass = (index: number): string => {
    const state = determineState(index);
    switch (state) {
      case "ERROR-ACTIVE":
      case "COMPLETE-ACTIVE":
      case "INCOMPLETE-ACTIVE":
        return "text-bold";
      default:
        return "";
    }
  };

  const getBorderColor = (index: number): string => {
    const state = determineState(index);
    switch (state) {
      case "ERROR-ACTIVE":
        return "border-error-dark";
      case "COMPLETE-ACTIVE":
        return "border-primary";
      case "INCOMPLETE-ACTIVE":
        return "border-accent-cool-darker";
      default:
        return "border-base-lighter";
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, index: number): void => {
    if (event.key === "Enter" || event.key === " ") {
      setFocusStep(props.currentStep);
      divRefs.current[props.currentStep]?.focus();
      props.onStepClicked(index);
    }

    if (event.key === "ArrowRight") {
      if (focusStep === props.steps.length - 1) {
        divRefs.current[0]?.focus();
        setFocusStep(0);
      } else {
        divRefs.current[focusStep + 1]?.focus();
        setFocusStep((prevFocusStep) => prevFocusStep + 1);
      }
    }

    if (event.key === "ArrowLeft") {
      if (focusStep === 0) {
        divRefs.current[props.steps.length - 1]?.focus();
        setFocusStep(props.steps.length - 1);
      } else {
        divRefs.current[focusStep - 1]?.focus();
        setFocusStep((prevFocusStep) => prevFocusStep - 1);
      }
    }

    if (event.key === "Tab") {
      setFocusStep(props.currentStep);
    }
  };

  const insertStepName = (content: string, stepName: string): string => {
    return modifyContent({
      content,
      condition: () => true,
      modificationMap: {
        stepName,
      },
    });
  };

  const insertStepState = (content: string, stepState: string): string => {
    return modifyContent({
      content,
      condition: () => true,
      modificationMap: {
        stepState,
      },
    });
  };

  const composeFormationTabAriaLabel = (content: string, stepName: string, stepState: string): string => {
    return insertStepState(insertStepName(content, stepName), stepState);
  };

  const divRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <>
      <div className="horizontal-step-indicator display-block">
        <div className="usa-step-indicator usa-step-indicator--counters-sm">
          <div className={`usa-step-indicator__segments stepper-wrapper`} role={"tablist"}>
            {props.steps.map((step: StepperStep, index: number) => {
              return (
                <div
                  key={`${step.name}-${index}`}
                  className={
                    `border-bottom-2px ${getBorderColor(index)} cursor-pointer ` +
                    `usa-step-indicator__segment usa-step-indicator__segment${getCSSClassColor(index)}`
                  }
                  data-num={getIcon(index)}
                  data-state={determineState(index)}
                  data-testid={`stepper-${index}`}
                  onClick={(): void => props.onStepClicked(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  role="tab"
                  tabIndex={index === props.currentStep ? 0 : -1}
                  aria-label={composeFormationTabAriaLabel(
                    Config.formation.general.ariaContextStepperLabels,
                    step.name,
                    determineAriaState(determineState(index))
                  )}
                  aria-selected={index === props.currentStep}
                  ref={(el) => {
                    divRefs.current[index] = el;
                  }}
                >
                  <div className={`usa-step-indicator__segment-label ${getBoldClass(index)}`}>
                    <span>{step.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className={"display-only-mobile-and-tablet margin-top-1 margin-bottom-2"}>
        <strong>{`Step ${props.currentStep + 1} of ${props.steps.length}:`}</strong>
        {` ${props.steps[props.currentStep].name}`}
      </div>
    </>
  );
};

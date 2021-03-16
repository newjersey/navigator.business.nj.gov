import React, { ReactElement, useEffect, useState } from "react";
import { useRoadmap } from "../lib/data/useRoadmap";
import { VerticalStepIndicator } from "./njwds-extended/VerticalStepIndicator";
import { MiniRoadmapTask } from "./MiniRoadmapTask";
import { Icon } from "./njwds/Icon";

interface Props {
  activeTaskId: string;
}

export const MiniRoadmap = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const [activeStepId, setActiveStepId] = useState<string | undefined>(getActiveStepId());
  const [openSteps, setOpenSteps] = useState<string[]>([]);

  function getActiveStepId(): string | undefined {
    return roadmap?.steps.find((step) => step.tasks.map((it) => it.id).includes(props.activeTaskId))?.id;
  }

  useEffect(() => {
    const activeStep = getActiveStepId();
    setActiveStepId(activeStep);
    setOpenSteps(activeStep ? [activeStep] : []);
  }, [props.activeTaskId, roadmap]);

  const toggleStep = (stepId: string): void => {
    if (openSteps.includes(stepId)) {
      setOpenSteps(openSteps.filter((id) => id !== stepId));
    } else {
      setOpenSteps([...openSteps, stepId]);
    }
  };

  const isLast = (stepId: string) => {
    return roadmap?.steps[roadmap?.steps.length - 1].id === stepId;
  };

  return (
    <nav>
      {roadmap?.steps.map((step) => (
        <div key={step.id}>
          <div className="fdr fac usa-prose margin-top-2 margin-bottom-2">
            <VerticalStepIndicator
              number={step.step_number}
              last={isLast(step.id)}
              active={step.id === activeStepId}
            />
            <button
              className="usa-button--unstyled width-100"
              onClick={() => toggleStep(step.id)}
              aria-expanded={openSteps.includes(step.id)}
            >
              <div className=" step-label fdr fjc fac">
                <h2
                  className={`margin-0 font-sans-sm line-height-body-2 ${
                    step.id === activeStepId ? "text-primary-dark" : "weight-unset"
                  }`}
                >
                  {step.name}
                </h2>
                <div className="padding-right-1 padding-left-1 mla">
                  <Icon>
                    {openSteps.includes(step.id)
                      ? "angle-arrow-up-primary-hover"
                      : "angle-arrow-down-primary-hover"}
                  </Icon>
                </div>
              </div>
            </button>
          </div>
          <div className="margin-left-6 font-sans-xs">
            {openSteps.includes(step.id) &&
              step.tasks.map((task) => (
                <MiniRoadmapTask key={task.id} task={task} active={task.id === props.activeTaskId} />
              ))}
          </div>
        </div>
      ))}
    </nav>
  );
};

/*{step.tasks.map((task) => (
                <MiniRoadmapTask key={task.id} task={task} active={task.id === props.activeTaskId}/>
              ))}*/

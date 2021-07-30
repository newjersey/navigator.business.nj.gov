import React, { ReactElement, useEffect, useState } from "react";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { VerticalStepIndicator } from "@/components/njwds-extended/VerticalStepIndicator";
import { MiniRoadmapTask } from "@/components/MiniRoadmapTask";
import { Icon } from "@/components/njwds/Icon";
import analytics from "@/lib/utils/analytics";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Step } from "@/lib/types/types";
import {isStepCompleted} from "@/lib/utils/helpers";


interface Props {
  activeTaskId: string;
}

export const MiniRoadmap = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const [activeStepId, setActiveStepId] = useState<string | undefined>(getActiveStepId());
  const [openSteps, setOpenSteps] = useState<string[]>([]);
  const { userData } = useUserData();

  function getActiveStepId(): string | undefined {
    return roadmap?.steps.find((step) => step.tasks.map((it) => it.id).includes(props.activeTaskId))?.id;
  }

  useEffect(() => {
    const activeStep = getActiveStepId();
    setActiveStepId(activeStep);
    setOpenSteps(activeStep ? [activeStep] : []);
  }, [props.activeTaskId, roadmap]);

  const toggleStep = (stepId: string): void => {
    analytics.event.task_mini_roadmap_step.click.expand_contract();
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

    <div>
      {roadmap?.steps.map((step) => (
        <div key={step.id} id={`vertical-content-${step.step_number}`}>
          <div className="fdr fac margin-top-2 margin-bottom-1">
    
            <VerticalStepIndicator
              number={step.step_number}
              last={isLast(step.id)}
              active={step.id === activeStepId}
              small={true}
              completed={isStepCompleted(step, userData)}
              key={openSteps.join(",")}
            />
        
            <button
              className="usa-button--unstyled width-100"
              onClick={() => toggleStep(step.id)}
              aria-expanded={openSteps.includes(step.id)}
            >
              <div className=" step-label sm fdr fjc fac">
                <h2
                  className={`margin-0 font-body-xs line-height-body-2 text-ink ${
                    step.id === activeStepId ? "text-primary-dark" : "weight-unset"
                  }`}
                  data-step={step.id}
                >
                  {step.name}
                </h2>
                <div className="padding-right-1 padding-left-1 mla fdc fac">
                  <Icon className="font-sans-lg text-ink">
                    {openSteps.includes(step.id) ? "expand_less" : "expand_more"}
                  </Icon>
                </div>
              </div>
            </button>
          </div>
          <div className="margin-left-5 font-sans-xs">
            {openSteps.includes(step.id) &&
              step.tasks.map((task) => (
                <MiniRoadmapTask key={task.id} task={task} active={task.id === props.activeTaskId} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

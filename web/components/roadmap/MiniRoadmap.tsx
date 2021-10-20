import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { VerticalStepIndicator } from "@/components/njwds-extended/VerticalStepIndicator";
import { MiniRoadmapTask } from "@/components/roadmap/MiniRoadmapTask";
import { Icon } from "@/components/njwds/Icon";
import analytics from "@/lib/utils/analytics";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getSectionNames, isStepCompleted } from "@/lib/utils/helpers";
import { SectionAccordion } from "@/components/roadmap/SectionAccordion";

interface Props {
  activeTaskId?: string | undefined;
  onTaskClick?: () => void;
}

export const MiniRoadmap = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const getActiveStepNumber = useCallback(() => {
    if (!props.activeTaskId) return undefined;
    return roadmap?.steps.find((step) => {
      const currTask = step.tasks.map((it) => it.id);
      if (props.activeTaskId) return currTask.includes(props.activeTaskId);
    })?.step_number;
  }, [props.activeTaskId, roadmap?.steps]);
  const [activeStepNumber, setActiveStepNumber] = useState<number | undefined>(getActiveStepNumber());
  const [openSteps, setOpenSteps] = useState<number[]>([]);
  const { userData } = useUserData();
  const roadmapExists = !!roadmap;

  useEffect(() => {
    const activeStep = getActiveStepNumber();
    setActiveStepNumber(activeStep);
    setOpenSteps(activeStep ? [activeStep] : []);
  }, [props.activeTaskId, roadmapExists, getActiveStepNumber]);

  const toggleStep = (stepNumber: number): void => {
    analytics.event.task_mini_roadmap_step.click.expand_contract();
    if (openSteps.includes(stepNumber)) {
      setOpenSteps(openSteps.filter((number) => number !== stepNumber));
    } else {
      setOpenSteps([...openSteps, stepNumber]);
    }
  };

  return (
    <>
      {getSectionNames(roadmap).map((section) => (
        <SectionAccordion key={section} sectionType={section} mini={true}>
          {roadmap?.steps
            .filter((step) => step.section === section)
            .map((step, index, array) => (
              <div key={step.step_number} id={`vertical-content-${step.step_number}`} className="margin-y-2">
                <div className="fdr fac padding-left-05">
                  <VerticalStepIndicator
                    stepNumber={step.step_number}
                    last={index === array.length - 1}
                    isOpen={openSteps.includes(step.step_number)}
                    active={step.step_number === activeStepNumber}
                    small={true}
                    completed={isStepCompleted(step, userData)}
                    key={openSteps.join(",")}
                  />
                  <button
                    className="usa-button--unstyled width-100"
                    onClick={() => toggleStep(step.step_number)}
                    aria-expanded={openSteps.includes(step.step_number)}
                  >
                    <div className=" step-label sm fdr fjc fac">
                      <h3
                        className={`margin-0 font-body-xs line-height-body-2 text-ink ${
                          step.step_number === activeStepNumber ? "text-primary-dark" : "weight-unset"
                        }`}
                        data-step={step.step_number}
                      >
                        {step.name}
                      </h3>
                      <div className="mla fdc fac">
                        <Icon className="usa-icon--size-3 text-ink">
                          {openSteps.includes(step.step_number) ? "expand_less" : "expand_more"}
                        </Icon>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="margin-left-5 font-sans-xs">
                  {openSteps.includes(step.step_number) &&
                    step.tasks.map((task) => (
                      <MiniRoadmapTask
                        key={task.id}
                        task={task}
                        active={task.id === props.activeTaskId}
                        onTaskClick={props.onTaskClick}
                      />
                    ))}
                </div>
              </div>
            ))}
        </SectionAccordion>
      ))}
    </>
  );
};

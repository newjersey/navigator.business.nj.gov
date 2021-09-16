import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { VerticalStepIndicator } from "@/components/njwds-extended/VerticalStepIndicator";
import { MiniRoadmapTask } from "@/components/MiniRoadmapTask";
import { Icon } from "@/components/njwds/Icon";
import analytics from "@/lib/utils/analytics";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isStepCompleted } from "@/lib/utils/helpers";
import { SectionType } from "@/lib/types/types";
import { SectionDefaults } from "@/display-content/roadmap/RoadmapDefaults";

interface Props {
  activeTaskId: string;
  onTaskClick?: () => void;
}

export const MiniRoadmap = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const getActiveStepNumber = useCallback(
    () =>
      roadmap?.steps.find((step) => step.tasks.map((it) => it.id).includes(props.activeTaskId))?.step_number,
    [props.activeTaskId, roadmap?.steps]
  );
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

  const getSection = (sectionType: SectionType) => {
    const sectionName = sectionType.toLowerCase();
    const publicName = SectionDefaults[sectionType];
    return (
      <div data-testid={`section-${sectionName}`}>
        <h3 className="flex flex-align-center margin-left-neg-05 margin-top-0">
          <img src={`/img/section-header-${sectionName}.svg`} alt={publicName} height={32} />{" "}
          <span className="padding-left-105">{publicName}</span>
        </h3>
        {roadmap?.steps
          .filter((step) => step.section === sectionType)
          .map((step, index, array) => (
            <div key={step.step_number} id={`vertical-content-${step.step_number}`} className="margin-top-2">
              <div className="fdr fac">
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
                    <h2
                      className={`margin-0 font-body-xs line-height-body-2 text-ink ${
                        step.step_number === activeStepNumber ? "text-primary-dark" : "weight-unset"
                      }`}
                      data-step={step.step_number}
                    >
                      {step.name}
                    </h2>
                    <div className="padding-right-1 padding-left-1 mla fdc fac">
                      <Icon className="font-sans-lg text-ink">
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
      </div>
    );
  };

  return (
    <>
      {getSection("PLAN")}
      <div>
        <hr className="margin-y-4 bg-base-lighter" />
      </div>
      {getSection("START")}
    </>
  );
};

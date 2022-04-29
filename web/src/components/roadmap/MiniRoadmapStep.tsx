import { VerticalStepIndicator } from "@/components/njwds-extended/VerticalStepIndicator";
import { Icon } from "@/components/njwds/Icon";
import { MiniRoadmapTask } from "@/components/roadmap/MiniRoadmapTask";
import { SectionAccordionContext } from "@/components/roadmap/SectionAccordion";
import { Step } from "@/lib/types/types";
import React, { ReactElement, useContext, useEffect, useMemo, useState } from "react";

interface Props {
  readonly step: Step;
  readonly isLast: boolean;
  readonly activeTaskId?: string;
  readonly isOpen?: boolean;
  readonly completed: boolean;
  readonly onTaskClick?: () => void;
  readonly toggleStep: (number: number, setOpen: boolean) => void;
}

export const MiniRoadmapStep = (props: Props): ReactElement => {
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen ?? false);
  const stepNumber = props.step.step_number;
  const { isOpen: sectionIsOpen } = useContext(SectionAccordionContext);
  const isActive = useMemo(() => {
    if (!props.activeTaskId) return undefined;
    return !!props.step.tasks.find((task) => task.id === props.activeTaskId);
  }, [props.activeTaskId, props.step]);

  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
      props.toggleStep(stepNumber, true);
    }
    // This kept re-rendering because of the props.function being passed as deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, stepNumber]);

  const toggleOpen = () => {
    props.toggleStep(stepNumber, !isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div key={`${stepNumber}-${isOpen}`} id={`vertical-content-${stepNumber}`} className="margin-y-2">
      <div className="flex flex-align-start">
        <VerticalStepIndicator
          stepNumber={stepNumber}
          last={props.isLast}
          isOpen={isOpen}
          hideBar={!sectionIsOpen}
          active={isActive}
          small={true}
          completed={props.completed}
        />
        <button className="usa-button--unstyled width-100" onClick={toggleOpen} aria-expanded={isOpen}>
          <div className=" step-label sm fdr fjc fac">
            <h3
              className={`margin-bottom-0 text-ink  ${
                isActive ? "text-primary-dark" : "weight-unset"
              } h4-styling`}
              data-step={stepNumber}
            >
              {props.step.name}
            </h3>
            <div className="mla fdc fac">
              <Icon className="usa-icon--size-3 text-ink">{isOpen ? "expand_less" : "expand_more"}</Icon>
            </div>
          </div>
        </button>
      </div>
      <div className="margin-left-5 font-sans-xs">
        {isOpen &&
          props.step.tasks.map((task) => (
            <MiniRoadmapTask
              key={task.id}
              task={task}
              active={task.id === props.activeTaskId}
              onTaskClick={props.onTaskClick}
            />
          ))}
      </div>
    </div>
  );
};

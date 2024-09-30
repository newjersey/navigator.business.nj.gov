import { ModifiedContent } from "@/components/ModifiedContent";
import { VerticalStepIndicator } from "@/components/njwds-extended/VerticalStepIndicator";
import { Icon } from "@/components/njwds/Icon";
import { MiniRoadmapTask } from "@/components/roadmap/MiniRoadmapTask";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { Step } from "@/lib/types/types";
import { ReactElement, useEffect, useMemo, useState } from "react";

interface Props {
  step: Step;
  isLast: boolean;
  activeTaskId?: string;
  isOpen?: boolean;
  completed: boolean;
  onTaskClick?: () => void;
  toggleStep: (number: number, setOpen: boolean, click: boolean) => void;
}

export const MiniRoadmapStep = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen ?? false);
  const stepNumber = props.step.stepNumber;
  const isActive = useMemo(() => {
    if (!props.activeTaskId || !roadmap?.tasks) {
      return undefined;
    }
    return roadmap?.tasks.some((task) => {
      return task.id === props.activeTaskId && task.stepNumber === stepNumber;
    });
  }, [props.activeTaskId, roadmap?.tasks, stepNumber]);
  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
      props.toggleStep(stepNumber, true, false);
    }
    // This kept re-rendering because of the props.function being passed as deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, stepNumber]);

  const toggleOpen = (): void => {
    props.toggleStep(stepNumber, !isOpen, true);
    setIsOpen((prevOpen) => {
      return !prevOpen;
    });
  };

  return (
    <div key={`${stepNumber}-${isOpen}`} id={`vertical-content-${stepNumber}`}>
      <div className="flex flex-row margin-y-2">
        <VerticalStepIndicator
          stepNumber={stepNumber}
          last={props.isLast}
          completed={props.completed}
          miniRoadmap={true}
          miniRoadmapSubtaskisOpen={isOpen}
        />

        <button className="usa-button--unstyled width-100" onClick={toggleOpen} aria-expanded={isOpen}>
          <div className="fdr fjc fac">
            <div
              role="heading"
              aria-level={4}
              className={`margin-left-5 padding-left-2px margin-bottom-0 text-base-darkest ${
                isActive ? "text-primary-dark" : "weight-unset"
              }`}
              data-step={stepNumber}
            >
              <ModifiedContent>{props.step.name}</ModifiedContent>
            </div>
            <div className="mla fdc fac">
              <Icon className="usa-icon--size-3 text-base-light">
                {isOpen ? "expand_less" : "expand_more"}
              </Icon>
            </div>
          </div>
        </button>
      </div>
      <div className="margin-left-5 font-sans-xs">
        {isOpen &&
          roadmap?.tasks
            .filter((task) => {
              return task.stepNumber === props.step.stepNumber;
            })
            .map((task) => {
              return (
                <MiniRoadmapTask
                  key={task.id}
                  task={task}
                  active={task.id === props.activeTaskId}
                  onTaskClick={props.onTaskClick}
                />
              );
            })}
      </div>
    </div>
  );
};

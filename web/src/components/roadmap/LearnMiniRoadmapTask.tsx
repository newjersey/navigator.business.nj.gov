import { LearnStepIndicator } from "@/components/roadmap/LearnStepIndicator";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  task: { id: string; name: string };
  active: boolean;
  onTaskClick?: () => void;
  stepNumber: number;
}

export const LearnMiniRoadmapTask = (props: Props): ReactElement => {
  return (
    <Link
      className="width-full display-block text-no-underline"
      href={`/learn/${props.task.id}`}
      onClick={props.onTaskClick}
    >
      <div
        className={`flex flex-row width-full padding-y-1 padding-right-4 text-underline-hover h6-styling ${
          props.active ? "learn-mini-roadmap-task--active" : ""
        }`}
        data-task={props.task.id}
        data-testid={`mini-roadmap-task-${props.task.id}`}
      >
        <LearnStepIndicator stepNumber={props.stepNumber} active={props.active} />
        <div className="margin-left-5">{props.task.name}</div>
      </div>
    </Link>
  );
};

import { Icon } from "@/components/njwds/Icon";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import Link from "next/link";
import { ReactElement } from "react";
import { UnStyledButton } from "../njwds-extended/UnStyledButton";

interface Props {
  task: Task;
  active: boolean;
  onTaskClick?: () => void;
}

export const MiniRoadmapTask = (props: Props): ReactElement => {
  const { business } = useUserData();
  const taskProgress = business?.taskProgress[props.task.id] || "NOT_STARTED";
  const taskProgressReadable = taskProgress.replace("_", " ");

  return (
    <Link href={`/tasks/${props.task.urlSlug}`} legacyBehavior>
      <div>
        <UnStyledButton
          onClick={(): void => {
            analytics.event.task_mini_roadmap_task.click.go_to_task(props.task.urlSlug);
            props.onTaskClick && props.onTaskClick();
          }}
        >
          <div
            className={`fdr fac padding-y-1 padding-left-1 padding-right-4 text-semibold-hover text-underline-hover ${
              props.active
                ? "bg-cool-lighter mini-roadmap-bg-shape text-primary-dark text-bold h5-styling"
                : "h6-styling"
            }`}
            data-task={props.task.id}
          >
            {taskProgress === "COMPLETED" ? (
              <Icon className="margin-right-1 checked-task text-success" iconName="check_circle" />
            ) : (
              <div className={`substep-unchecked margin-right-1 ${props.active ? "active" : ""}`} />
            )}
            <span className="margin-right-05">{props.task.name}</span>
            <span className="screen-reader-only">{taskProgressReadable}</span>
          </div>
        </UnStyledButton>
      </div>
    </Link>
  );
};

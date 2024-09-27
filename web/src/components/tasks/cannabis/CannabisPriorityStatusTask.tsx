import { TaskHeader } from "@/components/TaskHeader";
import { CannabisPriorityRequirements } from "@/components/tasks/cannabis/CannabisPriorityRequirements";
import { CannabisPriorityTypes } from "@/components/tasks/cannabis/CannabisPriorityTypes";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { TaskStatusChangeSnackbar } from "@/components/TaskStatusChangeSnackbar";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { scrollToTop, useMountEffect } from "@/lib/utils/helpers";
import { ReactElement, useState } from "react";

interface Props {
  task: Task;
  CMS_ONLY_tab?: string; // for CMS only
}

export const CannabisPriorityStatusTask = (props: Props): ReactElement => {
  const { business, updateQueue } = useUserData();
  const [successSnackbarIsOpen, setSuccessSnackbarIsOpen] = useState(false);
  const [displayFirstTab, setDisplayFirstTab] = useState(true);
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();

  useMountEffect(() => {
    if (props.CMS_ONLY_tab === "1") {
      setDisplayFirstTab(true);
    } else if (props.CMS_ONLY_tab === "2") {
      setDisplayFirstTab(false);
    }
  });

  const handleNextTabButtonClick = (): void => {
    if (!business || !updateQueue) return;

    setDisplayFirstTab(false);
    scrollToTop();
    if (
      business.taskProgress[props.task.id] === undefined ||
      business.taskProgress[props.task.id] === "NOT_STARTED"
    ) {
      setSuccessSnackbarIsOpen(true);
      updateQueue.queueTaskProgress({ [props.task.id]: "IN_PROGRESS" }).update();
    }
  };

  const handleBackButtonClick = (): void => {
    setDisplayFirstTab(true);
    scrollToTop();
  };

  const handleCompleteTaskButtonClick = (): void => {
    if (!business || !updateQueue) return;

    setSuccessSnackbarIsOpen(true);
    queueUpdateTaskProgress(props.task.id, "COMPLETED");
    updateQueue.update();
  };

  return (
    <div className="flex flex-column min-height-38rem">
      <TaskStatusChangeSnackbar
        isOpen={successSnackbarIsOpen}
        close={(): void => setSuccessSnackbarIsOpen(false)}
        status={business?.taskProgress[props.task.id] ?? "NOT_STARTED"}
      />
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      {displayFirstTab ? (
        <CannabisPriorityTypes
          task={props.task}
          onNextTab={handleNextTabButtonClick}
          CMS_ONLY_tab={props.CMS_ONLY_tab}
        />
      ) : (
        <CannabisPriorityRequirements
          onBack={handleBackButtonClick}
          onComplete={handleCompleteTaskButtonClick}
          CMS_ONLY_tab={props.CMS_ONLY_tab}
        />
      )}
    </div>
  );
};

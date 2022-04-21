import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { TaskHeader } from "@/components/TaskHeader";
import { CannabisPriorityRequirements } from "@/components/tasks/cannabis/CannabisPriorityRequirements";
import { CannabisPriorityTypes } from "@/components/tasks/cannabis/CannabisPriorityTypes";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { CannabisPriorityStatusDisplayContent, Task } from "@/lib/types/types";
import { scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { useState } from "react";

interface Props {
  task: Task;
  displayContent: CannabisPriorityStatusDisplayContent;
}

export const CannabisPriorityStatus = (props: Props) => {
  const { userData, update } = useUserData();
  const [successToastIsOpen, setSuccessToastIsOpen] = useState(false);
  const [displayFirstTab, setDisplayFirstTab] = useState(true);

  const handleNextTabButtonClick = () => {
    if (!userData) return;

    setDisplayFirstTab(false);
    scrollToTop();
    if (
      userData.taskProgress[props.task.id] === undefined ||
      userData.taskProgress[props.task.id] === "NOT_STARTED"
    ) {
      setSuccessToastIsOpen(true);
      update({
        ...userData,
        taskProgress: {
          ...userData.taskProgress,
          [props.task.id]: "IN_PROGRESS",
        },
      });
    }
  };

  const handleBackButtonClick = () => {
    setDisplayFirstTab(true);
    scrollToTop();
  };

  const handleCompleteTaskButtonClick = () => {
    if (!userData) return;

    setSuccessToastIsOpen(true);
    update({
      ...userData,
      taskProgress: {
        ...userData.taskProgress,
        [props.task.id]: "COMPLETED",
      },
    });
  };

  return (
    <div className="flex flex-column space-between minh-38">
      <ToastAlert variant="success" isOpen={successToastIsOpen} close={() => setSuccessToastIsOpen(false)}>
        {Config.taskDefaults.taskProgressSuccessToastBody}
      </ToastAlert>
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      {displayFirstTab ? (
        <CannabisPriorityTypes task={props.task} onNextTab={handleNextTabButtonClick} />
      ) : (
        <CannabisPriorityRequirements
          displayContent={props.displayContent}
          onBack={handleBackButtonClick}
          onComplete={handleCompleteTaskButtonClick}
        />
      )}
    </div>
  );
};

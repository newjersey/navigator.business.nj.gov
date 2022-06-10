import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { TaskHeader } from "@/components/TaskHeader";
import { CannabisPriorityRequirements } from "@/components/tasks/cannabis/CannabisPriorityRequirements";
import { CannabisPriorityTypes } from "@/components/tasks/cannabis/CannabisPriorityTypes";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { scrollToTop, useMountEffect } from "@/lib/utils/helpers";
import { useState } from "react";

interface Props {
  task: Task;
  CMS_ONLY_tab?: string; // for CMS only
}

export const CannabisPriorityStatusTask = (props: Props) => {
  const { userData, update } = useUserData();
  const [successToastIsOpen, setSuccessToastIsOpen] = useState(false);
  const [displayFirstTab, setDisplayFirstTab] = useState(true);
  const { Config } = useConfig();

  useMountEffect(() => {
    if (props.CMS_ONLY_tab === "1") {
      setDisplayFirstTab(true);
    } else if (props.CMS_ONLY_tab === "2") {
      setDisplayFirstTab(false);
    }
  });

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
    <div className="flex flex-column minh-38">
      <ToastAlert variant="success" isOpen={successToastIsOpen} close={() => setSuccessToastIsOpen(false)}>
        {Config.taskDefaults.taskProgressSuccessToastBody}
      </ToastAlert>
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

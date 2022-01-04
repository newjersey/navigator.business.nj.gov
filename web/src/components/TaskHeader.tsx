import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Icon } from "@/components/njwds/Icon";
import { TaskProgressDropdown } from "@/components/TaskProgressDropdown";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SectionType, Task, TaskProgress } from "@/lib/types/types";
import {
  getModifiedTaskContent,
  getSectionCompletion,
  getSectionPositions,
  setPreferencesCloseSection,
} from "@/lib/utils/helpers";
import React, { ReactElement, useState } from "react";
import { CongratulatoryDialog } from "./CongratulatoryDialog";

interface Props {
  task: Task;
  tooltipText?: string;
}

export const TaskHeader = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const { roadmap, sectionCompletion, updateStatus } = useRoadmap();
  const [nextSection, setNextSection] = useState<SectionType | undefined>(undefined);
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

  const handleDialogClose = (): void => {
    setDialogIsOpen(false);
  };

  const updateTaskProgress = (newValue: TaskProgress): void => {
    if (!userData || !roadmap || !sectionCompletion) return;
    const updatedUserData = {
      ...userData,
      taskProgress: { ...userData?.taskProgress, [props.task.id]: newValue },
    };
    const updatedSectionCompletion = getSectionCompletion(roadmap, updatedUserData);
    const currentSectionPositions = getSectionPositions(updatedSectionCompletion, roadmap, props.task.id);

    let preferences = updatedUserData.preferences;

    const sectionStatusHasChanged =
      updatedSectionCompletion[currentSectionPositions.current] !==
      sectionCompletion[currentSectionPositions.current];

    if (sectionStatusHasChanged && updatedSectionCompletion[currentSectionPositions.current]) {
      setNextSection(currentSectionPositions.next);
      setDialogIsOpen(true);
      preferences = setPreferencesCloseSection(updatedUserData.preferences, currentSectionPositions.current);
    }
    updateStatus(updatedSectionCompletion);
    update({
      ...updatedUserData,
      preferences,
    });
  };

  const renderProgress = (): ReactElement => {
    let currentTaskProgress: TaskProgress = "NOT_STARTED";
    if (userData?.taskProgress && userData.taskProgress[props.task.id]) {
      currentTaskProgress = userData.taskProgress[props.task.id];
    }

    if (props.tooltipText) {
      return (
        <div className="fdr">
          {TaskProgressTagLookup[currentTaskProgress]}
          <ArrowTooltip title={props.tooltipText}>
            <div className="fdr fac margin-left-05" data-testid="automatic-status-info-tooltip">
              <Icon>help_outline</Icon>
            </div>
          </ArrowTooltip>
        </div>
      );
    } else {
      return <TaskProgressDropdown onSelect={updateTaskProgress} initialValue={currentTaskProgress} />;
    }
  };

  return (
    <>
      <div
        role="heading"
        aria-level={1}
        className="margin-top-0 margin-bottom-2 h2-styling"
        data-task-id={props.task.id}
      >
        {getModifiedTaskContent(roadmap, props.task, "name")}
      </div>
      <div className="margin-top-0 margin-bottom-2">{renderProgress()}</div>
      <UserDataErrorAlert />
      <CongratulatoryDialog
        nextSectionType={nextSection}
        handleClose={handleDialogClose}
        open={dialogIsOpen}
      />
    </>
  );
};

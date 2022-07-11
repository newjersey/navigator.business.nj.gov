import { ArrowTooltip } from "@/components/ArrowTooltip";
import { CongratulatoryDialog } from "@/components/CongratulatoryDialog";
import { Content } from "@/components/Content";
import { DialogTwoButton } from "@/components/DialogTwoButton";
import { FormationDateModal } from "@/components/FormationDateModal";
import { Tag } from "@/components/njwds-extended/Tag";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { Icon } from "@/components/njwds/Icon";
import { TaskProgressDropdown } from "@/components/TaskProgressDropdown";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SectionType, Task, TaskProgress } from "@/lib/types/types";
import {
  getModifiedTaskBooleanUndefined,
  getModifiedTaskContent,
  getSectionCompletion,
  getSectionPositions,
  setPreferencesCloseSection,
} from "@/lib/utils/helpers";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, useState } from "react";

interface Props {
  task: Task;
  tooltipText?: string;
}

export const TaskHeader = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const { roadmap, sectionCompletion, updateStatus } = useRoadmap();
  const [nextSection, setNextSection] = useState<SectionType | undefined>(undefined);
  const [congratulatoryDialogIsOpen, setCongratulatoryDialogIsOpen] = useState<boolean>(false);
  const [formationDialogIsOpen, setFormationDialogIsOpen] = useState<boolean>(false);
  const [areYouSureDialogDesiredNewStatus, setAreYouSureDialogDesiredNewStatus] = useState<
    TaskProgress | undefined
  >(undefined);
  const [successToastIsOpen, setSuccessToastIsOpen] = useState<boolean>(false);

  const { Config } = useConfig();

  const handleDialogClose = (): void => {
    setCongratulatoryDialogIsOpen(false);
  };

  const isFormationTask = (): boolean => {
    return props.task.id === "form-business-entity-foreign" || props.task.id === "form-business-entity";
  };

  const onDropdownChanged = (newValue: TaskProgress): void => {
    if (!userData) return;
    let updatedUserData = { ...userData };
    const currentTaskProgress = userData.taskProgress[props.task.id];

    if (isFormationTask()) {
      if (newValue === "COMPLETED") {
        setFormationDialogIsOpen(true);
        return;
      } else if (currentTaskProgress === "COMPLETED" && areYouSureDialogDesiredNewStatus === undefined) {
        setAreYouSureDialogDesiredNewStatus(newValue);
        return;
      } else {
        updatedUserData = {
          ...userData,
          profileData: {
            ...userData.profileData,
            dateOfFormation: undefined,
          },
        };
      }
      setAreYouSureDialogDesiredNewStatus(undefined);
    }

    setFormationDialogIsOpen(false);
    updateTaskProgress(newValue, updatedUserData);
  };

  const updateTaskProgress = (newValue: TaskProgress, userData: UserData): void => {
    if (!sectionCompletion || !roadmap) return;
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
      setCongratulatoryDialogIsOpen(true);
      preferences = setPreferencesCloseSection(updatedUserData.preferences, currentSectionPositions.current);
    }
    updateStatus(updatedSectionCompletion);
    update({
      ...updatedUserData,
      preferences,
    })
      .then(() => {
        setSuccessToastIsOpen(true);
      })
      .catch(() => {});
  };

  const renderProgress = (): ReactElement => {
    let currentTaskProgress: TaskProgress = "NOT_STARTED";
    if (userData?.taskProgress && userData.taskProgress[props.task.id]) {
      currentTaskProgress = userData.taskProgress[props.task.id];
    }

    return props.tooltipText ? (
      <div className="fdr">
        {TaskProgressTagLookup[currentTaskProgress]}
        <ArrowTooltip title={props.tooltipText}>
          <div className="fdr fac margin-left-05" data-testid="automatic-status-info-tooltip">
            <Icon>help_outline</Icon>
          </div>
        </ArrowTooltip>
      </div>
    ) : (
      <TaskProgressDropdown onSelect={onDropdownChanged} value={currentTaskProgress} />
    );
  };

  return (
    <>
      <h1 data-task-id={props.task.id}>{getModifiedTaskContent(roadmap, props.task, "name")}</h1>
      <div
        className="flex flex-align-center flex-wrap margin-top-0 margin-bottom-2"
        data-testid="taskProgress"
      >
        {renderProgress()}
        {getModifiedTaskBooleanUndefined(roadmap, props.task, "required") === true && (
          <div className="flex flex-align-center tablet:margin-left-05">
            <Tag tagVariant="required">
              <img
                className="margin-right-05 margin-left-neg-1px margin-y-neg-1px"
                width="20px"
                height="20px"
                src="/img/required-task-icon.svg"
                alt=""
              />
              {Config.taskDefaults.requiredTagText}
            </Tag>
          </div>
        )}
      </div>
      <UserDataErrorAlert />
      <CongratulatoryDialog
        nextSectionType={nextSection}
        handleClose={handleDialogClose}
        open={congratulatoryDialogIsOpen}
      />
      <FormationDateModal
        isOpen={formationDialogIsOpen}
        close={() => setFormationDialogIsOpen(false)}
        onSave={updateTaskProgress}
      />
      <DialogTwoButton
        isOpen={areYouSureDialogDesiredNewStatus !== undefined}
        close={() => setAreYouSureDialogDesiredNewStatus(undefined)}
        title={Config.formationDateModal.areYouSureModalHeader}
        primaryButtonText={Config.formationDateModal.areYouSureModalContinueButtonText}
        primaryButtonOnClick={() => {
          if (areYouSureDialogDesiredNewStatus) {
            onDropdownChanged(areYouSureDialogDesiredNewStatus);
          }
        }}
        secondaryButtonText={Config.formationDateModal.areYouSureModalCancelButtonText}
      >
        <Content>{Config.formationDateModal.areYouSureModalBody}</Content>
      </DialogTwoButton>
      <ToastAlert variant="success" isOpen={successToastIsOpen} close={() => setSuccessToastIsOpen(false)}>
        {Config.taskDefaults.taskProgressSuccessToastBody}
      </ToastAlert>
    </>
  );
};

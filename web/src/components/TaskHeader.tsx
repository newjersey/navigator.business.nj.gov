import { ArrowTooltip } from "@/components/ArrowTooltip";
import { CongratulatoryModal } from "@/components/CongratulatoryModal";
import { Content } from "@/components/Content";
import { FormationDateModal } from "@/components/FormationDateModal";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { Tag } from "@/components/njwds-extended/Tag";
import { Icon } from "@/components/njwds/Icon";
import { TaskProgressDropdown } from "@/components/TaskProgressDropdown";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import { SectionType, Task, TaskProgress } from "@/lib/types/types";
import {
  getModifiedTaskBooleanUndefined,
  getModifiedTaskContent,
  getSectionCompletion,
  getSectionPositions,
  setPreferencesCloseSection,
} from "@/lib/utils/helpers";
import { isFormationTask, UserData } from "@businessnjgovnavigator/shared";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";

interface Props {
  task: Task;
  tooltipText?: string;
}

export const TaskHeader = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const { roadmap, sectionCompletion, updateStatus } = useRoadmap();
  const [nextSection, setNextSection] = useState<SectionType | undefined>(undefined);
  const [congratulatoryModalIsOpen, setCongratulatoryModalIsOpen] = useState<boolean>(false);
  const [formationModalIsOpen, setFormationModalIsOpen] = useState<boolean>(false);
  const [areYouSureModalDesiredNewStatus, setAreYouSureModalDesiredNewStatus] = useState<
    TaskProgress | undefined
  >(undefined);
  const [successSnackbarIsOpen, setSuccessSnackbarIsOpen] = useState<boolean>(false);
  const router = useRouter();

  const { Config } = useConfig();

  const handleModalClose = (): void => {
    setCongratulatoryModalIsOpen(false);
  };

  const hasCompletedAPIFormation = (): boolean => {
    return userData?.formationData.getFilingResponse?.success === true;
  };

  const onDropdownChanged = (newValue: TaskProgress): void => {
    if (!userData) return;
    let updatedUserData = { ...userData };
    const currentTaskProgress = userData.taskProgress[props.task.id];

    if (isFormationTask(props.task.id)) {
      if (newValue === "COMPLETED" && currentTaskProgress !== "COMPLETED") {
        setFormationModalIsOpen(true);
        return;
      } else if (currentTaskProgress === "COMPLETED" && areYouSureModalDesiredNewStatus === undefined) {
        setAreYouSureModalDesiredNewStatus(newValue);
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
      setAreYouSureModalDesiredNewStatus(undefined);
    }

    setFormationModalIsOpen(false);
    updateTaskProgress(newValue, updatedUserData, { redirectOnSuccess: false });
  };

  const updateTaskProgress = (
    newValue: TaskProgress,
    userData: UserData,
    { redirectOnSuccess }: { redirectOnSuccess: boolean }
  ): void => {
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
      setCongratulatoryModalIsOpen(true);
      preferences = setPreferencesCloseSection(updatedUserData.preferences, currentSectionPositions.current);
    }
    updateStatus(updatedSectionCompletion);
    update({
      ...updatedUserData,
      preferences,
    })
      .then(() => {
        setSuccessSnackbarIsOpen(true);
        if (redirectOnSuccess) {
          router.push({
            pathname: routeForPersona(userData.profileData.businessPersona),
            query: { fromFormBusinessEntity: isFormationTask(props.task.id) ? "true" : "false" },
          });
        }
      })
      .catch(() => {});
  };

  const renderProgress = (): ReactElement => {
    let currentTaskProgress: TaskProgress = "NOT_STARTED";
    if (userData?.taskProgress && userData.taskProgress[props.task.id]) {
      currentTaskProgress = userData.taskProgress[props.task.id];
    }

    let tooltipText: string | undefined = props.tooltipText;
    if (isFormationTask(props.task.id) && hasCompletedAPIFormation()) {
      tooltipText = Config.formationDateModal.lockedStatusTooltipText;
    }

    return tooltipText ? (
      <div className="fdr">
        {TaskProgressTagLookup[currentTaskProgress]}
        <ArrowTooltip title={tooltipText}>
          <div className="fdr fac margin-left-05" data-testid="status-info-tooltip">
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
      <CongratulatoryModal
        nextSectionType={nextSection}
        handleClose={handleModalClose}
        open={congratulatoryModalIsOpen}
      />
      <FormationDateModal
        isOpen={formationModalIsOpen}
        close={() => setFormationModalIsOpen(false)}
        onSave={updateTaskProgress}
      />
      <ModalTwoButton
        isOpen={areYouSureModalDesiredNewStatus !== undefined}
        close={() => setAreYouSureModalDesiredNewStatus(undefined)}
        title={Config.formationDateModal.areYouSureModalHeader}
        primaryButtonText={Config.formationDateModal.areYouSureModalContinueButtonText}
        primaryButtonOnClick={() => {
          if (areYouSureModalDesiredNewStatus) {
            onDropdownChanged(areYouSureModalDesiredNewStatus);
          }
        }}
        secondaryButtonText={Config.formationDateModal.areYouSureModalCancelButtonText}
      >
        <Content>{Config.formationDateModal.areYouSureModalBody}</Content>
      </ModalTwoButton>
      <SnackbarAlert
        variant="success"
        isOpen={successSnackbarIsOpen}
        close={() => setSuccessSnackbarIsOpen(false)}
      >
        {Config.taskDefaults.taskProgressSuccessSnackbarBody}
      </SnackbarAlert>
    </>
  );
};

import { ArrowTooltip } from "@/components/ArrowTooltip";
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
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import { Task, TaskProgress } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getModifiedTaskBooleanUndefined, getModifiedTaskContent } from "@/lib/utils/helpers";
import { emptyProfileData, isFormationTask, isTaxTask } from "@businessnjgovnavigator/shared";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { TaxRegistrationModal } from "./TaxRegistrationModal";

interface Props {
  task: Task;
  tooltipText?: string;
}

export const TaskHeader = (props: Props): ReactElement => {
  const { userData, updateQueue } = useUserData();
  const { roadmap } = useRoadmap();
  const [formationModalIsOpen, setFormationModalIsOpen] = useState<boolean>(false);
  const [taxRegistrationModalIsOpen, setTaxRegistrationModalIsOpen] = useState<boolean>(false);
  const [areYouSureModalDesiredNewStatus, setAreYouSureModalDesiredNewStatus] = useState<
    TaskProgress | undefined
  >(undefined);
  const [successSnackbarIsOpen, setSuccessSnackbarIsOpen] = useState<boolean>(false);
  const [areYouSureTaxModalDesiredNewStatus, setAreYouSureTaxModalDesiredNewStatus] = useState<
    TaskProgress | undefined
  >(undefined);
  const router = useRouter();
  const { queueUpdateTaskProgress, congratulatoryModal } = useUpdateTaskProgress();

  const { Config } = useConfig();

  const hasCompletedAPIFormation = (): boolean => {
    return userData?.formationData.getFilingResponse?.success === true;
  };

  const onDropdownChanged = (newValue: TaskProgress): void => {
    if (!userData || !updateQueue) return;
    const currentTaskProgress = userData.taskProgress[props.task.id];
    if (currentTaskProgress === newValue) return;

    if (isFormationTask(props.task.id)) {
      if (currentTaskProgress !== "COMPLETED" && newValue === "COMPLETED") {
        setFormationModalIsOpen(true);
        analytics.event.task_status_dropdown.click_completed.show_formation_date_modal();
        return;
      } else if (currentTaskProgress === "COMPLETED" && areYouSureModalDesiredNewStatus === undefined) {
        setAreYouSureModalDesiredNewStatus(newValue);
        return;
      } else {
        updateQueue.queueProfileData({ dateOfFormation: emptyProfileData.dateOfFormation });
      }
      setAreYouSureModalDesiredNewStatus(undefined);
    }

    if (isTaxTask(props.task.id)) {
      if (newValue === "COMPLETED" && currentTaskProgress !== "COMPLETED") {
        setTaxRegistrationModalIsOpen(true);
        return;
      } else if (currentTaskProgress === "COMPLETED" && areYouSureTaxModalDesiredNewStatus === undefined) {
        setAreYouSureTaxModalDesiredNewStatus(newValue);
        return;
      }
      setAreYouSureTaxModalDesiredNewStatus(undefined);
    }

    setFormationModalIsOpen(false);
    setTaxRegistrationModalIsOpen(false);
    updateAndReroute(newValue, { redirectOnSuccess: false });
  };

  const updateAndReroute = (
    newValue: TaskProgress,
    { redirectOnSuccess }: { redirectOnSuccess: boolean }
  ): void => {
    if (!userData || !updateQueue) return;

    queueUpdateTaskProgress(props.task.id, newValue);
    updateQueue
      .update()
      .then(() => {
        setSuccessSnackbarIsOpen(true);
        if (!redirectOnSuccess) return;
        router.push({
          pathname: routeForPersona(userData.profileData.businessPersona),
          query: {
            fromFormBusinessEntity: isFormationTask(props.task.id) ? "true" : "false",
            fromTaxRegistration: isTaxTask(props.task.id) ? "true" : "false",
          },
        });
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

      <>{congratulatoryModal}</>
      <FormationDateModal
        isOpen={formationModalIsOpen}
        close={() => setFormationModalIsOpen(false)}
        onSave={updateAndReroute}
      />
      <TaxRegistrationModal
        isOpen={taxRegistrationModalIsOpen}
        close={() => setTaxRegistrationModalIsOpen(false)}
        onSave={updateAndReroute}
      />
      <ModalTwoButton
        isOpen={areYouSureTaxModalDesiredNewStatus !== undefined}
        close={() => setAreYouSureTaxModalDesiredNewStatus(undefined)}
        title={Config.taxRegistrationModal.areYouSureTaxTitle}
        primaryButtonText={Config.taxRegistrationModal.areYouSureTaxContinueButton}
        primaryButtonOnClick={() => {
          if (areYouSureTaxModalDesiredNewStatus) {
            onDropdownChanged(areYouSureTaxModalDesiredNewStatus);
          }
        }}
        secondaryButtonText={Config.taxRegistrationModal.areYouSureTaxCancelButton}
      >
        <Content>{Config.taxRegistrationModal.areYouSureTaxBody}</Content>
      </ModalTwoButton>
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

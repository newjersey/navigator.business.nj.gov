import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { FormationDateModal } from "@/components/FormationDateModal";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import { TaskStatusChangeSnackbar } from "@/components/TaskStatusChangeSnackbar";
import { TaskStatusTaxRegistrationSnackbar } from "@/components/TaskStatusTaxRegistrationSnackbar";
import { Icon } from "@/components/njwds/Icon";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES, routeWithQuery } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { isFormationTask, isTaxTask } from "@businessnjgovnavigator/shared/domain-logic/taskIds";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { TaskProgress } from "@businessnjgovnavigator/shared/userData";
import { useRouter } from "next/router";
import { ReactElement, ReactNode, useContext, useState } from "react";

interface Props {
  taskId: string;
  disabledTooltipText: string | undefined;
  STORYBOOK_ONLY_currentTaskProgress?: TaskProgress;
}

type ModalTypes = "formation" | "formation-unset" | "registered-for-taxes-unset";

export const TaskProgressCheckbox = (props: Props): ReactElement => {
  const { business, updateQueue } = useUserData();
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const { queueUpdateTaskProgress, congratulatoryModal } = useUpdateTaskProgress();
  const [successSnackbarIsOpen, setSuccessSnackbarIsOpen] = useState<boolean>(false);
  const [currentOpenModal, setCurrentOpenModal] = useState<ModalTypes | undefined>(undefined);
  const [taxRegistrationSnackbarIsOpen, setTaxRegistrationSnackbarIsOpen] = useState<boolean>(false);
  const router = useRouter();
  const { Config } = useConfig();

  const currentTaskProgress: TaskProgress =
    props.STORYBOOK_ONLY_currentTaskProgress ?? business?.taskProgress[props.taskId] ?? "NOT_STARTED";
  const isDisabled = !!props.disabledTooltipText;

  const getNextStatus = (): TaskProgress => {
    switch (currentTaskProgress) {
      case "NOT_STARTED":
        return "IN_PROGRESS";
      case "IN_PROGRESS":
        return "COMPLETED";
      case "COMPLETED":
        return "NOT_STARTED";
    }
  };

  const setToNextStatus = (config?: { redirectOnSuccess: boolean }): void => {
    if (!updateQueue) return;
    let redirectOnSuccess = config?.redirectOnSuccess;
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setShowNeedsAccountModal(true);
      return;
    }
    const nextStatus = getNextStatus();

    if (isFormationTask(props.taskId)) {
      if (nextStatus === "COMPLETED" && currentOpenModal === undefined) {
        setCurrentOpenModal("formation");
        analytics.event.task_status_checkbox.click_completed.show_formation_date_modal();
        return;
      }
      if (currentTaskProgress === "COMPLETED" && currentOpenModal === undefined) {
        setCurrentOpenModal("formation-unset");
        return;
      }
      if (currentOpenModal === "formation-unset") {
        updateQueue.queueProfileData({ dateOfFormation: emptyProfileData.dateOfFormation });
      }
    }

    if (isTaxTask(props.taskId)) {
      if (nextStatus === "COMPLETED") {
        redirectOnSuccess = true;
        analytics.event.tax_registration_snackbar.submit.show_tax_registration_success_snackbar();
      }
      if (currentTaskProgress === "COMPLETED" && currentOpenModal === undefined) {
        setCurrentOpenModal("registered-for-taxes-unset");
        return;
      }
    }

    setCurrentOpenModal(undefined);
    queueUpdateTaskProgress(props.taskId, nextStatus);
    sendAnalytics(nextStatus);
    updateQueue
      .update()
      .then(() => {
        if (!(isFormationTask(props.taskId) && nextStatus === "COMPLETED")) setSuccessSnackbarIsOpen(true);
        if (!redirectOnSuccess) {
          return;
        }
        routeWithQuery(router, {
          path: ROUTES.dashboard,
          queries: {
            [QUERIES.fromFormBusinessEntity]: isFormationTask(props.taskId) ? "true" : "false",
          },
        });
      })
      .catch(() => {});
  };

  const sendAnalytics = (nextStatus: TaskProgress): void => {
    switch (nextStatus) {
      case "NOT_STARTED":
        analytics.event.task_status_checkbox.click.selected_not_started_status();
        break;
      case "IN_PROGRESS":
        analytics.event.task_status_checkbox.click.selected_in_progress_status();
        break;
      case "COMPLETED":
        analytics.event.task_status_checkbox.click.selected_completed_status();
        break;
    }
  };

  const getStyles = (): { border: string; bg: string; textColor: string; hover: string } => {
    switch (currentTaskProgress) {
      case "NOT_STARTED":
        if (isDisabled) {
          return {
            border: "border-base-light",
            bg: "bg-base-lightest",
            textColor: "",
            hover: "",
          };
        } else {
          return {
            border: "border-base",
            bg: "bg-white",
            textColor: "",
            hover: "task-checkbox-base-lighter",
          };
        }
      case "IN_PROGRESS":
        if (isDisabled) {
          return {
            border: "border-accent-cool-light",
            bg: "bg-accent-cool-lightest",
            textColor: "text-accent-cool-dark",
            hover: "",
          };
        } else {
          return {
            border: "border-accent-cool-dark",
            bg: "bg-white",
            textColor: "text-accent-cool-dark",
            hover: "task-checkbox-accent-cool-lighter",
          };
        }
      case "COMPLETED":
        if (isDisabled) {
          return {
            border: "border-primary-more-light",
            bg: "bg-primary-more-light",
            textColor: "text-white",
            hover: "",
          };
        } else {
          return {
            border: "border-primary-light",
            bg: "bg-primary-light",
            textColor: "text-white",
            hover: "task-checkbox-primary-lightest",
          };
        }
    }
  };

  const getIcon = (): string => {
    switch (currentTaskProgress) {
      case "NOT_STARTED":
        return "";
      case "IN_PROGRESS":
        return "more_horiz";
      case "COMPLETED":
        return "check";
    }
  };

  const getAdditionalAriaContext = (): string => {
    if (isFormationTask(props.taskId)) {
      if (getNextStatus() === "COMPLETED") {
        return Config.formation.general.ariaContextWillNeedToProvideBusinessDate;
      }
      if (currentTaskProgress === "COMPLETED") {
        return Config.formation.general.ariaContextWillLooseCalendarAndCertificationAccess;
      }
    }
    return "";
  };

  const Checkbox = (): ReactNode => {
    const styles = getStyles();
    return (
      <button
        data-testid="change-task-progress-checkbox"
        aria-label={`update task status. ${getAdditionalAriaContext()}`}
        onClick={isDisabled ? undefined : (): void => setToNextStatus()}
        className={`cursor-pointer margin-neg-105 padding-105 usa-button--unstyled task-checkbox-base ${styles.hover}`}
        {...(isDisabled ? { disabled: true } : {})}
      >
        <span
          className={
            `border-2px radius-md ` +
            `display-flex flex-row flex-justify-center flex-align-center ` +
            `${styles.border} ${styles.bg} ${styles.textColor}`
          }
          style={{ width: "22px", height: "22px" }}
        >
          <Icon iconName={getIcon()} />
        </span>
      </button>
    );
  };

  return (
    <div className={"flex flex-align-center"}>
      <>{congratulatoryModal}</>

      <div className="margin-right-2">
        {isDisabled ? (
          <ArrowTooltip title={props.disabledTooltipText || ""}>
            <div data-testid="status-info-tooltip" className={"line-height-100"}>
              {Checkbox()}
            </div>
          </ArrowTooltip>
        ) : (
          <>{Checkbox()}</>
        )}
      </div>

      <span className="flex flex-align-center">{TaskProgressTagLookup[currentTaskProgress]}</span>

      <TaskStatusChangeSnackbar
        isOpen={successSnackbarIsOpen}
        close={(): void => setSuccessSnackbarIsOpen(false)}
        status={currentTaskProgress}
      />

      <TaskStatusTaxRegistrationSnackbar
        isOpen={taxRegistrationSnackbarIsOpen}
        close={(): void => setTaxRegistrationSnackbarIsOpen(false)}
      />

      <FormationDateModal
        isOpen={currentOpenModal === "formation"}
        close={(): void => setCurrentOpenModal(undefined)}
        onSave={(config): void => setToNextStatus(config)}
      />

      <ModalTwoButton
        isOpen={currentOpenModal === "registered-for-taxes-unset"}
        close={(): void => setCurrentOpenModal(undefined)}
        title={Config.registeredForTaxesModal.areYouSureTaxTitle}
        primaryButtonText={Config.registeredForTaxesModal.areYouSureTaxContinueButton}
        primaryButtonOnClick={(): void => setToNextStatus()}
        secondaryButtonText={Config.registeredForTaxesModal.areYouSureTaxCancelButton}
      >
        <Content>{Config.registeredForTaxesModal.areYouSureTaxBody}</Content>
      </ModalTwoButton>

      <ModalTwoButton
        isOpen={currentOpenModal === "formation-unset"}
        close={(): void => setCurrentOpenModal(undefined)}
        title={Config.formationDateModal.areYouSureModalHeader}
        primaryButtonText={Config.formationDateModal.areYouSureModalContinueButtonText}
        primaryButtonOnClick={(): void => setToNextStatus()}
        secondaryButtonText={Config.formationDateModal.areYouSureModalCancelButtonText}
      >
        <Content>{Config.formationDateModal.areYouSureModalBody}</Content>
      </ModalTwoButton>
    </div>
  );
};

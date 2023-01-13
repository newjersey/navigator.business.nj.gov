import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { FormationDateModal } from "@/components/FormationDateModal";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { Icon } from "@/components/njwds/Icon";
import { RegisteredForTaxesModal } from "@/components/RegisteredForTaxesModal";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import { AuthAlertContext } from "@/contexts/authAlertContext";
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
import { ReactElement, useContext, useState } from "react";

interface Props {
  taskId: string;
  disabledTooltipText: string | undefined;
}

type ModalTypes = "formation" | "formation-unset" | "registered-for-taxes" | "registered-for-taxes-unset";

export const TaskProgressCheckbox = (props: Props): ReactElement => {
  const { userData, updateQueue } = useUserData();
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);
  const { queueUpdateTaskProgress, congratulatoryModal } = useUpdateTaskProgress();
  const [successSnackbarIsOpen, setSuccessSnackbarIsOpen] = useState<boolean>(false);
  const [currentOpenModal, setCurrentOpenModal] = useState<ModalTypes | undefined>(undefined);
  const router = useRouter();
  const { Config } = useConfig();

  const currentTaskProgress: TaskProgress = userData?.taskProgress[props.taskId] || "NOT_STARTED";
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

  const setToNextStatus = (config?: { redirectOnSuccess: boolean }) => {
    if (!updateQueue || !userData) {
      return;
    }
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setRegistrationModalIsVisible(true);
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
      if (nextStatus === "COMPLETED" && currentOpenModal === undefined) {
        setCurrentOpenModal("registered-for-taxes");
        analytics.event.task_status_checkbox.click_completed.show_tax_registration_date_modal();
        return;
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
        setSuccessSnackbarIsOpen(true);
        if (!config?.redirectOnSuccess) {
          return;
        }
        routeWithQuery(router, {
          path: ROUTES.dashboard,
          queries: {
            [QUERIES.fromFormBusinessEntity]: isFormationTask(props.taskId) ? "true" : "false",
            [QUERIES.fromTaxRegistration]: isTaxTask(props.taskId) ? "true" : "false",
          },
        });
      })
      .catch(() => {});
  };

  const sendAnalytics = (nextStatus: TaskProgress) => {
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

  const getStyles = () => {
    switch (currentTaskProgress) {
      case "NOT_STARTED":
        if (isDisabled) {
          return {
            border: "border-base-light",
            bg: "bg-base-lightest",
            textColor: "",
          };
        } else {
          return {
            border: "border-base",
            bg: "bg-white",
            textColor: "",
          };
        }
      case "IN_PROGRESS":
        if (isDisabled) {
          return {
            border: "border-accent-cool-light",
            bg: "bg-accent-cool-lightest",
            textColor: "text-accent-cool-dark",
          };
        } else {
          return {
            border: "border-accent-cool-dark",
            bg: "bg-white",
            textColor: "text-accent-cool-dark",
          };
        }
      case "COMPLETED":
        if (isDisabled) {
          return {
            border: "border-primary-disabled",
            bg: "bg-primary-disabled",
            textColor: "text-white",
          };
        } else {
          return {
            border: "border-primary-light",
            bg: "bg-primary-light",
            textColor: "text-white",
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

  const Checkbox = () => {
    const styles = getStyles();
    return (
      <button
        data-testid="change-task-progress-checkbox"
        aria-label="update task status"
        onClick={
          isDisabled
            ? undefined
            : () => {
                return setToNextStatus();
              }
        }
        className={`cursor-pointer margin-neg-105 padding-105 usa-button--unstyled`}
      >
        <span
          className={
            `border-2px radius-md ` +
            `display-flex flex-row flex-justify-center flex-align-center ` +
            `${styles.border} ${styles.bg} ${styles.textColor}`
          }
          style={{ width: "22px", height: "22px" }}
        >
          <Icon>{getIcon()}</Icon>
        </span>
      </button>
    );
  };

  return (
    <>
      <>{congratulatoryModal}</>

      {isDisabled ? (
        <ArrowTooltip title={props.disabledTooltipText || ""}>
          <div data-testid="status-info-tooltip">{Checkbox()}</div>
        </ArrowTooltip>
      ) : (
        <>{Checkbox()}</>
      )}

      <span className="margin-left-105">{TaskProgressTagLookup[currentTaskProgress]}</span>

      <SnackbarAlert
        variant="success"
        isOpen={successSnackbarIsOpen}
        close={() => {
          return setSuccessSnackbarIsOpen(false);
        }}
      >
        {Config.taskDefaults.taskProgressSuccessSnackbarBody}
      </SnackbarAlert>

      <FormationDateModal
        isOpen={currentOpenModal === "formation"}
        close={() => {
          return setCurrentOpenModal(undefined);
        }}
        onSave={(config) => {
          return setToNextStatus(config);
        }}
      />

      <RegisteredForTaxesModal
        isOpen={currentOpenModal === "registered-for-taxes"}
        close={() => {
          return setCurrentOpenModal(undefined);
        }}
        onSave={(config) => {
          return setToNextStatus(config);
        }}
      />

      <ModalTwoButton
        isOpen={currentOpenModal === "registered-for-taxes-unset"}
        close={() => {
          return setCurrentOpenModal(undefined);
        }}
        title={Config.registeredForTaxesModal.areYouSureTaxTitle}
        primaryButtonText={Config.registeredForTaxesModal.areYouSureTaxContinueButton}
        primaryButtonOnClick={() => {
          return setToNextStatus();
        }}
        secondaryButtonText={Config.registeredForTaxesModal.areYouSureTaxCancelButton}
      >
        <Content>{Config.registeredForTaxesModal.areYouSureTaxBody}</Content>
      </ModalTwoButton>

      <ModalTwoButton
        isOpen={currentOpenModal === "formation-unset"}
        close={() => {
          return setCurrentOpenModal(undefined);
        }}
        title={Config.formationDateModal.areYouSureModalHeader}
        primaryButtonText={Config.formationDateModal.areYouSureModalContinueButtonText}
        primaryButtonOnClick={() => {
          return setToNextStatus();
        }}
        secondaryButtonText={Config.formationDateModal.areYouSureModalCancelButtonText}
      >
        <Content>{Config.formationDateModal.areYouSureModalBody}</Content>
      </ModalTwoButton>
    </>
  );
};

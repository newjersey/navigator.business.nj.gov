import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { FormationDateModal } from "@/components/FormationDateModal";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import { TaxRegistrationModal } from "@/components/TaxRegistrationModal";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import { QUERIES, routeWithQuery } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { isFormationTask, isTaxTask } from "@businessnjgovnavigator/shared/domain-logic/taskIds";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { TaskProgress } from "@businessnjgovnavigator/shared/userData";
import { useRouter } from "next/router";
import { ReactElement, useContext, useState } from "react";
import { Icon } from "./njwds/Icon";

interface Props {
  taskId: string;
  disabledTooltipText: string | undefined;
}

type ModalTypes = "formation" | "formation-unset" | "tax-registration" | "tax-registration-unset";

export const TaskProgressCheckbox = (props: Props): ReactElement => {
  const { userData, updateQueue } = useUserData();
  const { isAuthenticated, setModalIsVisible } = useContext(AuthAlertContext);
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
    if (!updateQueue || !userData) return;
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setModalIsVisible(true);
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
        setCurrentOpenModal("tax-registration");
        analytics.event.task_status_checkbox.click_completed.show_tax_registration_date_modal();
        return;
      }
      if (currentTaskProgress === "COMPLETED" && currentOpenModal === undefined) {
        setCurrentOpenModal("tax-registration-unset");
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
        if (!config?.redirectOnSuccess) return;
        routeWithQuery(router, {
          path: routeForPersona(userData.profileData.businessPersona),
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
            bg: "",
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
            bg: "",
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
        onClick={isDisabled ? undefined : () => setToNextStatus()}
        className={
          `cursor-pointer border-2px radius-md margin-right-105 padding-0 ` +
          `display-flex flex-row flex-justify-center flex-align-center ` +
          `${styles.border} ${styles.bg} ${styles.textColor}`
        }
        style={{ width: "22px", height: "22px" }}
      >
        <Icon>{getIcon()}</Icon>
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

      <>{TaskProgressTagLookup[currentTaskProgress]}</>

      <SnackbarAlert
        variant="success"
        isOpen={successSnackbarIsOpen}
        close={() => setSuccessSnackbarIsOpen(false)}
      >
        {Config.taskDefaults.taskProgressSuccessSnackbarBody}
      </SnackbarAlert>

      <FormationDateModal
        isOpen={currentOpenModal === "formation"}
        close={() => setCurrentOpenModal(undefined)}
        onSave={(config) => setToNextStatus(config)}
      />

      <TaxRegistrationModal
        isOpen={currentOpenModal === "tax-registration"}
        close={() => setCurrentOpenModal(undefined)}
        onSave={(config) => setToNextStatus(config)}
      />

      <ModalTwoButton
        isOpen={currentOpenModal === "tax-registration-unset"}
        close={() => setCurrentOpenModal(undefined)}
        title={Config.taxRegistrationModal.areYouSureTaxTitle}
        primaryButtonText={Config.taxRegistrationModal.areYouSureTaxContinueButton}
        primaryButtonOnClick={() => setToNextStatus()}
        secondaryButtonText={Config.taxRegistrationModal.areYouSureTaxCancelButton}
      >
        <Content>{Config.taxRegistrationModal.areYouSureTaxBody}</Content>
      </ModalTwoButton>

      <ModalTwoButton
        isOpen={currentOpenModal === "formation-unset"}
        close={() => setCurrentOpenModal(undefined)}
        title={Config.formationDateModal.areYouSureModalHeader}
        primaryButtonText={Config.formationDateModal.areYouSureModalContinueButtonText}
        primaryButtonOnClick={() => setToNextStatus()}
        secondaryButtonText={Config.formationDateModal.areYouSureModalCancelButtonText}
      >
        <Content>{Config.formationDateModal.areYouSureModalBody}</Content>
      </ModalTwoButton>
    </>
  );
};

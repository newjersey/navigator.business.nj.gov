import { Content } from "@/components/Content";
import { DialogTwoButton } from "@/components/DialogTwoButton";
import { Alert } from "@/components/njwds-extended/Alert";
import { Icon } from "@/components/njwds/Icon";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskHeader } from "@/components/TaskHeader";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { fetchTaskByFilename } from "@/lib/async-content-fetchers/fetchTaskByFilename";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ReactElement, useState } from "react";

interface Props {
  task: Task;
}

export const NexusFormationTask = (props: Props): ReactElement => {
  const [taskToDisplay, setTaskToDisplay] = useState<Task>(props.task);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [showCtaModal, setShowCtaModal] = useState<boolean>(false);
  const { userData } = useUserData();
  const { Config } = useConfig();

  useMountEffectWhenDefined(async () => {
    if (!userData) return;
    if (!userData.profileData.businessName || userData.profileData.nexusDbaName === "") {
      setShowWarning(true);
    } else if (userData.profileData.nexusDbaName === undefined) {
      const legacyTask = await fetchTaskByFilename("form-business-entity");
      setTaskToDisplay(legacyTask);
    }
  }, userData);

  const isDba = (): boolean => {
    return userData ? userData.profileData.nexusDbaName !== undefined : false;
  };

  const getFormattedBody = (): ReactElement => {
    if (!isDba()) {
      return <Content>{taskToDisplay.contentMd}</Content>;
    }

    const [beforeIndentation, after] = taskToDisplay.contentMd.split("${beginIndentationSection}");
    const [indentedSection, afterIndentation] = after.split("${endIndentationSection}");

    const customComponents = {
      greenCheckmark: <Icon className="inline-icon text-green">check_circle</Icon>,
      redXMark: <Icon className="inline-icon text-red">cancel</Icon>,
    };

    return (
      <>
        <Content>{beforeIndentation}</Content>
        <div className="margin-left-8 margin-y-2">
          <Content customComponents={customComponents}>{indentedSection}</Content>
        </div>
        <div>
          <Content>{afterIndentation}</Content>
        </div>
      </>
    );
  };

  return (
    <div id="taskElement" className="flex flex-column space-between minh-38">
      <DialogTwoButton
        isOpen={showCtaModal}
        close={() => setShowCtaModal(false)}
        title={Config.nexusFormationTask.dbaCtaModalHeader}
        primaryButtonText={Config.nexusFormationTask.dbaCtaModalContinueButtonText}
        primaryButtonOnClick={() => window.open(taskToDisplay.callToActionLink, "_ blank")}
        secondaryButtonText={Config.nexusFormationTask.dbaCtaModalCancelButtonText}
      >
        <Content>{Config.nexusFormationTask.dbaCtaModalBody}</Content>
      </DialogTwoButton>
      <div>
        <TaskHeader task={taskToDisplay} />
        {showWarning && (
          <Alert variant="warning" dataTestid="name-search-warning">
            <Content>{Config.nexusFormationTask.warningText}</Content>
          </Alert>
        )}
        {!showWarning && (
          <>
            <UnlockedBy task={props.task} />
            {getFormattedBody()}
            {taskToDisplay.issuingAgency || taskToDisplay.formName ? (
              <>
                <hr className="margin-y-3" />
                {taskToDisplay.issuingAgency ? (
                  <div>
                    <span className="h5-styling">{`${Config.taskDefaults.issuingAgencyText}: `}</span>
                    <span className="h6-styling">{taskToDisplay.issuingAgency}</span>
                  </div>
                ) : null}
                {taskToDisplay.formName ? (
                  <div>
                    <span className="h5-styling">{`${Config.taskDefaults.formNameText}: `}</span>
                    <span className="h6-styling">{taskToDisplay.formName}</span>
                  </div>
                ) : null}
              </>
            ) : null}
          </>
        )}
      </div>
      {!showWarning && (
        <TaskCTA
          link={taskToDisplay.callToActionLink}
          text={taskToDisplay.callToActionText}
          onClick={isDba() ? () => setShowCtaModal(true) : undefined}
        />
      )}
    </div>
  );
};

import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { TaskHeader } from "@/components/TaskHeader";
import { LegalStructureRadio } from "@/components/tasks/business-structure/LegalStructureRadio";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { TaskStatusChangeSnackbar } from "@/components/TaskStatusChangeSnackbar";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { createProfileFieldErrorMap, Task } from "@/lib/types/types";
import { getFlow, templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { hasCompletedFormation, TaskProgress, UserData } from "@businessnjgovnavigator/shared";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  task: Task;
  CMS_ONLY_fakeUserData?: UserData; // for CMS only
}

export const BusinessStructureTask = (props: Props): ReactElement => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [showRadioQuestion, setShowRadioQuestion] = useState<boolean>(true);
  const [successSnackbarIsOpen, setSuccessSnackbarIsOpen] = useState<boolean>(false);
  const { Config } = useConfig();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();
  const userDataFromHook = useUserData();
  const userData = props.CMS_ONLY_fakeUserData ?? userDataFromHook.userData;
  const [isTaskCompleted, setTaskCompleted] = useState<boolean>(
    userData?.taskProgress[props.task.id] === "COMPLETED"
  );
  const updateQueue = userDataFromHook.updateQueue;
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createProfileFieldErrorMap());

  useEffect(() => {
    return () => {
      if (userData?.profileData.legalStructureId) {
        updateLocalAndQueueTaskStatus("COMPLETED");
      } else if (!userData?.profileData.legalStructureId) {
        updateLocalAndQueueTaskStatus("NOT_STARTED");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateQueue]);

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    setProfileData(userData.profileData);
    setShowRadioQuestion(!userData.profileData.legalStructureId);
  }, userData);

  FormFuncWrapper(async () => {
    if (!updateQueue || !userData) {
      return;
    }

    updateLocalAndQueueTaskStatus("COMPLETED");
    await updateQueue.queueProfileData(profileData).update();
    setShowRadioQuestion(false);
    setSuccessSnackbarIsOpen(true);
  });

  const setBackToEditing = (): void => {
    if (!userData || !updateQueue) {
      return;
    }
    setShowRadioQuestion(true);
    updateLocalAndQueueTaskStatus("IN_PROGRESS");
  };

  const removeTaskCompletion = async (): Promise<void> => {
    if (!updateQueue) return;

    updateQueue.queueProfileData({
      legalStructureId: undefined,
      operatingPhase:
        profileData.operatingPhase === "GUEST_MODE_WITH_BUSINESS_STRUCTURE"
          ? "GUEST_MODE"
          : profileData.operatingPhase,
    });
    updateLocalAndQueueTaskStatus("NOT_STARTED");

    setShowRadioQuestion(true);
    await updateQueue.update();

    const updatedProfileState: ProfileData = {
      ...profileData,
      legalStructureId: undefined,
      operatingPhase:
        profileData.operatingPhase === "GUEST_MODE_WITH_BUSINESS_STRUCTURE"
          ? "GUEST_MODE"
          : profileData.operatingPhase,
    };
    setProfileData(updatedProfileState);
  };

  const preLookupContent = props.task.contentMd.split("${businessStructureSelectionComponent}")[0];
  const postLookupContent = props.task.contentMd.split("${businessStructureSelectionComponent}")[1];

  const updateLocalAndQueueTaskStatus = (taskStatus: TaskProgress): void => {
    queueUpdateTaskProgress(props.task.id, taskStatus);
    setTaskCompleted(taskStatus === "COMPLETED");
  };

  const canEdit = (): boolean => {
    if (!userData) return false;
    return !hasCompletedFormation(userData);
  };

  const getTaskProgressTooltip = (): string => {
    if (!userData) return "";
    if (!isTaskCompleted) {
      return Config.businessStructureTask.uncompletedTooltip;
    } else if (hasCompletedFormation(userData)) {
      return Config.profileDefaults.lockedFieldTooltipText;
    } else {
      return Config.businessStructureTask.completedTooltip;
    }
  };

  return (
    <div className="minh-38" data-testid={"business-structure-task"}>
      <TaskHeader task={props.task} tooltipText={getTaskProgressTooltip()} />
      <UnlockedBy task={props.task} />
      <Content>{preLookupContent}</Content>
      {showRadioQuestion && (
        <profileFormContext.Provider value={formContextState}>
          <ProfileDataContext.Provider
            value={{
              state: {
                profileData: profileData,
                flow: getFlow(profileData),
              },
              setUser: (): void => {},
              setProfileData,
              onBack: (): void => {},
            }}
          >
            <LegalStructureRadio taskId={props.task.id} />
            <div className="margin-top-4">
              <SecondaryButton isColor="primary" onClick={onSubmit} dataTestId={"save-business-structure"}>
                {Config.businessStructureTask.saveButton}
              </SecondaryButton>
            </div>
          </ProfileDataContext.Provider>
        </profileFormContext.Provider>
      )}
      {userData && !showRadioQuestion && (
        <>
          <h3>{Config.businessStructureTask.completedHeader}</h3>
          <Alert variant="success">
            <div className={`flex ${isLargeScreen ? "flex-row" : "flex-column"}`} data-testid="success-alert">
              <Content>
                {templateEval(Config.businessStructureTask.successMessage, {
                  legalStructure: LookupLegalStructureById(userData.profileData.legalStructureId).name,
                })}
              </Content>
              {canEdit() ? (
                <div>
                  <UnStyledButton
                    className={`${isLargeScreen ? "margin-left-2" : ""}`}
                    style="default"
                    isUnderline
                    onClick={setBackToEditing}
                  >
                    {Config.taskDefaults.editText}
                  </UnStyledButton>
                  <span className="margin-left-1">|</span>

                  <UnStyledButton
                    className="margin-left-1"
                    style="default"
                    isUnderline
                    onClick={removeTaskCompletion}
                  >
                    {Config.taskDefaults.removeText}
                  </UnStyledButton>
                </div>
              ) : (
                <div className="margin-left-2 flex flex-row flex-align-center">
                  <ArrowTooltip title={Config.profileDefaults.lockedFieldTooltipText}>
                    <div className="fdr fac font-body-lg">
                      <Icon>help_outline</Icon>
                    </div>
                  </ArrowTooltip>
                </div>
              )}
            </div>
          </Alert>
        </>
      )}
      <Content>{postLookupContent}</Content>
      <TaskStatusChangeSnackbar
        isOpen={successSnackbarIsOpen}
        close={(): void => setSuccessSnackbarIsOpen(false)}
      />
    </div>
  );
};

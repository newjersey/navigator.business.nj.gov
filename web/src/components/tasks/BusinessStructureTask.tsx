import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import { TaskHeader } from "@/components/TaskHeader";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { TaskStatusChangeSnackbar } from "@/components/TaskStatusChangeSnackbar";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap, Task } from "@/lib/types/types";
import { getFlow, templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { hasCompletedFormation, UserData } from "@businessnjgovnavigator/shared";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
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
  const updateQueue = userDataFromHook.updateQueue;

  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createProfileFieldErrorMap());

  useEffect(() => {
    if (!userData) {
      return;
    }
    setProfileData(userData.profileData);
  }, [userData]);

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    setShowRadioQuestion(!userData.profileData.legalStructureId);
  }, userData);

  FormFuncWrapper(async () => {
    if (!updateQueue || !userData) {
      return;
    }
    const profileDataHasNotChanged = JSON.stringify(profileData) === JSON.stringify(userData.profileData);
    if (profileDataHasNotChanged) {
      return;
    }

    queueUpdateTaskProgress(props.task.id, "COMPLETED");
    await updateQueue.queueProfileData(profileData).update();
    setShowRadioQuestion(false);
    setSuccessSnackbarIsOpen(true);
  });

  const setBackToEditing = (): void => {
    if (!userData || !updateQueue) {
      return;
    }
    setShowRadioQuestion(true);
    queueUpdateTaskProgress(props.task.id, "IN_PROGRESS");
  };

  const preLookupContent = props.task.contentMd.split("${businessStructureSelectionComponent}")[0];
  const postLookupContent = props.task.contentMd.split("${businessStructureSelectionComponent}")[1];

  const isCompleted = (): boolean => {
    if (!userData) return false;
    return userData.taskProgress[props.task.id] === "COMPLETED";
  };

  const canEdit = (): boolean => {
    if (!userData) return false;
    return !hasCompletedFormation(userData);
  };

  const getTaskProgressTooltip = (): string => {
    if (!userData) return "";
    if (!isCompleted()) {
      return Config.businessStructureTask.uncompletedTooltip;
    } else if (hasCompletedFormation(userData)) {
      return Config.profileDefaults.lockedFieldTooltipText;
    } else {
      return Config.businessStructureTask.completedTooltip;
    }
  };

  return (
    <div className="minh-38">
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
            <h3>{Config.businessStructureTask.radioQuestionHeader}</h3>
            <OnboardingLegalStructure />
            <div className="margin-top-4">
              <SecondaryButton isColor="primary" onClick={onSubmit}>
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
            <div className="flex flex-row">
              {templateEval(Config.businessStructureTask.successMessage, {
                legalStructure: LookupLegalStructureById(userData.profileData.legalStructureId).name,
              })}
              {canEdit() ? (
                <UnStyledButton
                  className="margin-left-2"
                  style="tertiary"
                  underline
                  onClick={setBackToEditing}
                >
                  {Config.taskDefaults.editText}
                </UnStyledButton>
              ) : (
                <ArrowTooltip title={Config.profileDefaults.lockedFieldTooltipText}>
                  <div className="fdr fac margin-left-2 font-body-lg">
                    <Icon>help_outline</Icon>
                  </div>
                </ArrowTooltip>
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

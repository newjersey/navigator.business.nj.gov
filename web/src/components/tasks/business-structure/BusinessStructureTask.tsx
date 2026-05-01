import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { Heading } from "@/components/njwds-extended/Heading";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Icon } from "@/components/njwds/Icon";
import { TaskHeader } from "@/components/TaskHeader";
import { LegalStructureRadio } from "@/components/tasks/business-structure/LegalStructureRadio";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { TaskStatusChangeSnackbar } from "@/components/TaskStatusChangeSnackbar";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import {
  getFlow,
  scrollToTopOfElement,
  templateEval,
  useMountEffectWhenDefined,
} from "@/lib/utils/helpers";
import { Business, hasCompletedFormation } from "@businessnjgovnavigator/shared";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Task } from "@businessnjgovnavigator/shared/types";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useEffect, useRef, useState } from "react";

interface Props {
  task: Task;
  CMS_ONLY_fakeBusiness?: Business;
}

export const BusinessStructureTask = (props: Props): ReactElement => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [showRadioQuestion, setShowRadioQuestion] = useState<boolean>(true);
  const [successSnackbarIsOpen, setSuccessSnackbarIsOpen] = useState<boolean>(false);
  const { Config } = useConfig();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();
  const userDataFromHook = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const updateQueue = userDataFromHook.updateQueue;
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createDataFormErrorMap());

  const whenErrorScrollToRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return (): void => {
      if (business?.profileData.legalStructureId) {
        queueUpdateTaskProgress(props.task.id, "COMPLETED");
      } else if (!business?.profileData.legalStructureId) {
        queueUpdateTaskProgress(props.task.id, "TO_DO");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateQueue]);

  useMountEffectWhenDefined(() => {
    if (!business) return;
    setProfileData(business.profileData);
    setShowRadioQuestion(!business.profileData.legalStructureId);
  }, business);

  FormFuncWrapper(
    async () => {
      if (!updateQueue || !business) return;

      queueUpdateTaskProgress(props.task.id, "COMPLETED");
      await updateQueue.queueProfileData(profileData).update();
      setShowRadioQuestion(false);
      setSuccessSnackbarIsOpen(true);
    },
    (isValid) => {
      if (!isValid) {
        scrollToTopOfElement(whenErrorScrollToRef.current, { focusElement: true });
      }
    },
  );

  const setBackToEditing = (): void => {
    if (!business || !updateQueue) return;
    setShowRadioQuestion(true);
    queueUpdateTaskProgress(props.task.id, "TO_DO");
  };

  const removeTaskCompletion = async (): Promise<void> => {
    if (!updateQueue) return;

    updateQueue
      .queueProfileData({
        legalStructureId: undefined,
        operatingPhase:
          profileData.operatingPhase === OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE
            ? OperatingPhaseId.GUEST_MODE
            : profileData.operatingPhase,
      })
      .queueTaskProgress({ [props.task.id]: "TO_DO" });

    setShowRadioQuestion(true);
    await updateQueue.update();

    const updatedProfileState: ProfileData = {
      ...profileData,
      legalStructureId: undefined,
      operatingPhase:
        profileData.operatingPhase === OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE
          ? OperatingPhaseId.GUEST_MODE
          : profileData.operatingPhase,
    };
    setProfileData(updatedProfileState);
  };

  const preLookupContent = props.task.contentMd.split("${businessStructureSelectionComponent}")[0];
  const postLookupContent = props.task.contentMd.split("${businessStructureSelectionComponent}")[1];

  const isCompleted = (): boolean => {
    if (!updateQueue) return false;
    return updateQueue.currentBusiness().taskProgress[props.task.id] === "COMPLETED";
  };

  const canEdit = (): boolean => {
    if (!business) return false;
    return !hasCompletedFormation(business);
  };

  const getTaskProgressTooltip = (): string => {
    if (!business) return "";
    if (!isCompleted()) {
      return Config.businessStructureTask.uncompletedTooltip;
    } else if (hasCompletedFormation(business)) {
      return Config.profileDefaults.default.lockedFieldTooltipText;
    } else {
      return Config.businessStructureTask.completedTooltip;
    }
  };

  return (
    <div data-testid={"business-structure-task"}>
      <TaskHeader task={props.task} tooltipText={getTaskProgressTooltip()} />
      <UnlockedBy task={props.task} />
      <Content className="margin-bottom-3">{preLookupContent}</Content>
      {showRadioQuestion && (
        <div className="margin-bottom-6">
          <DataFormErrorMapContext.Provider value={formContextState}>
            <ProfileDataContext.Provider
              value={{
                state: {
                  profileData: profileData,
                  flow: getFlow(profileData),
                },
                setProfileData,
                onBack: (): void => {},
              }}
            >
              <LegalStructureRadio taskId={props.task.id} ref={whenErrorScrollToRef} />
            </ProfileDataContext.Provider>
          </DataFormErrorMapContext.Provider>
        </div>
      )}
      {business && !showRadioQuestion && (
        <div className="margin-bottom-3">
          <Heading level={2}>{Config.businessStructureTask.completedHeader}</Heading>
          <Alert variant="success">
            <div
              className={`flex ${isLargeScreen ? "flex-row" : "flex-column"}`}
              data-testid="success-alert"
            >
              <Content>
                {templateEval(Config.businessStructureTask.successMessage, {
                  legalStructure: LookupLegalStructureById(business.profileData.legalStructureId)
                    .name,
                })}
              </Content>
              {canEdit() ? (
                <div>
                  <UnStyledButton
                    className={`${isLargeScreen ? "margin-left-2" : ""}`}
                    isUnderline
                    onClick={setBackToEditing}
                    ariaLabel={`${Config.taskDefaults.editText} ${Config.businessStructureTask.ariaLabelText}`}
                  >
                    {Config.taskDefaults.editText}
                  </UnStyledButton>
                  <span className="margin-left-1">|</span>

                  <UnStyledButton
                    className="margin-left-1"
                    isUnderline
                    onClick={removeTaskCompletion}
                    ariaLabel={`${Config.taskDefaults.removeText} ${Config.businessStructureTask.ariaLabelText}`}
                  >
                    {Config.taskDefaults.removeText}
                  </UnStyledButton>
                </div>
              ) : (
                <div className="margin-left-2 flex flex-row flex-align-center">
                  <ArrowTooltip title={Config.profileDefaults.default.lockedFieldTooltipText}>
                    <div className="fdr fac font-body-lg">
                      <Icon iconName="help_outline" />
                    </div>
                  </ArrowTooltip>
                </div>
              )}
            </div>
          </Alert>
        </div>
      )}
      <Content>{postLookupContent}</Content>
      <TaskStatusChangeSnackbar
        isOpen={successSnackbarIsOpen}
        close={(): void => setSuccessSnackbarIsOpen(false)}
        status={"COMPLETED"}
      />

      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton
            analyticsEvent={analytics.event.select_industry_task.click.open_live_chat}
          />
          <PrimaryButton
            isColor="primary"
            onClick={onSubmit}
            dataTestId="save-business-structure"
            isRightMarginRemoved={true}
          >
            <Content>{Config.businessStructureTask.saveButton}</Content>
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </div>
  );
};

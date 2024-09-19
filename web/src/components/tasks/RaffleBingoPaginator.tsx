import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import {
  getAgencyName,
  getRaffleBingoTask,
  RaffleBingoSteps,
  shouldDisplayBackButton,
  shouldDisplayContinueButton,
  shouldDisplayMarkAsCompleteButton,
} from "@/components/tasks/RaffleBingoSteps";
import { TaskStatusChangeSnackbar } from "@/components/TaskStatusChangeSnackbar";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { TaskProgress } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, ReactNode, useEffect, useState } from "react";

interface Props {
  task: Task;
}

export const RaffleBingoPaginator = (props: Props): ReactElement => {
  const [stepIndex, setStepIndex] = useState(0);
  const [task, setTask] = useState<Task>();
  const { business, updateQueue } = useUserData();
  const [successSnackbarIsOpen, setSuccessSnackbarIsOpen] = useState<boolean>(false);

  const { Config } = useConfig();

  useEffect(() => {
    getRaffleBingoTask(stepIndex).then((task) => {
      setTask(task);
    });
  }, [stepIndex]);

  const onMoveToStep = (stepIndex: number): void => {
    setStepIndex(stepIndex);
  };

  const getContinueButtonText = (stepIndex: number): string => {
    if (stepIndex === RaffleBingoSteps.length - 1) {
      return Config.taskDefaults.backButtonText;
    } else {
      return Config.taskDefaults.continueButtonText;
    }
  };

  const markTaskAsComplete = (): void => {
    if (!business || !updateQueue) return;
    const completed: TaskProgress = "COMPLETED";
    updateQueue.queueTaskProgress({ ["raffle-bingo-games-license"]: completed });
    updateQueue.update();
    setSuccessSnackbarIsOpen(true);
  };

  const displayCompletedSnackbar = (): ReactNode => {
    const currentTaskProgress: TaskProgress = business?.taskProgress[props.task?.id] ?? "COMPLETED";

    return (
      <TaskStatusChangeSnackbar
        isOpen={successSnackbarIsOpen}
        close={(): void => setSuccessSnackbarIsOpen(false)}
        status={currentTaskProgress}
      />
    );
  };

  const stepItems = RaffleBingoSteps.map((item) => {
    return { name: item.stepLabel };
  });

  const getIssuingAgencyName = (): string => {
    const currentStep = RaffleBingoSteps[stepIndex];
    return getAgencyName(currentStep.agencyId);
  };

  return (
    <>
      <div className="margin-bottom-3">
        <Content>{task?.summaryDescriptionMd ?? ""}</Content>
      </div>
      <HorizontalStepper
        steps={stepItems}
        currentStep={stepIndex}
        onStepClicked={(step: number): void => {
          onMoveToStep(step);
        }}
      />

      <div data-testid={task?.filename}>
        <Content>{task?.contentMd ?? ""}</Content>
        <div className="margin-bottom-4 margin-left-2">
          <SingleCtaLink
            link={task?.callToActionLink ?? ""}
            text={task?.callToActionText}
            buttonColor="outline"
            noBackgroundColor={true}
            alignLeft={true}
            iconName="launch"
          />
        </div>
      </div>
      <HorizontalLine />
      <div>
        <span className="text-bold">Issuing Agency: </span>
        {getIssuingAgencyName()}
      </div>

      <div>
        <CtaContainer noBackgroundColor={false}>
          <ActionBarLayout>
            {shouldDisplayContinueButton(stepIndex) && (
              <PrimaryButton
                isColor="primary"
                onClick={(): void => {
                  onMoveToStep(stepIndex + 1);
                }}
                dataTestId="continue-button"
                isRightMarginRemoved={true}
              >
                {getContinueButtonText(stepIndex)}
              </PrimaryButton>
            )}
            {shouldDisplayBackButton(stepIndex) && (
              <div className="margin-top-2 mobile-lg:margin-top-0">
                <SecondaryButton
                  isColor="primary"
                  onClick={(): void => {
                    onMoveToStep(stepIndex - 1);
                  }}
                  dataTestId="back-button"
                  isRightMarginRemoved={false}
                >
                  {Config.taskDefaults.backButtonText}
                </SecondaryButton>
              </div>
            )}
            {shouldDisplayMarkAsCompleteButton(stepIndex) && (
              <PrimaryButton
                isColor="primary"
                onClick={(): void => {
                  markTaskAsComplete();
                }}
                dataTestId="mark-as-complete-button"
                isRightMarginRemoved={true}
              >
                {Config.taskDefaults.markAsCompleteButtonText}
              </PrimaryButton>
            )}
            {displayCompletedSnackbar()}
          </ActionBarLayout>
        </CtaContainer>
      </div>
    </>
  );
};

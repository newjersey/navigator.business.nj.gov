import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { TaskHeader } from "@/components/TaskHeader";
import { TaskStatusChangeSnackbar } from "@/components/TaskStatusChangeSnackbar";
import { fetchTaskByFilename } from "@/lib/async-content-fetchers/fetchTaskByFilename";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { StepperStep, Task } from "@/lib/types/types";
import { LookupTaskAgencyById } from "@businessnjgovnavigator/shared";
import { TaskProgress } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";

interface Props {
  task: Task;
  CMS_ONLY_stepIndex?: number;
}

export const RaffleBingoPaginator = (props: Props): ReactElement<any> => {
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const [step, setStep] = useState<Task>();
  const { business, updateQueue } = useUserData();
  const [successSnackbarIsOpen, setSuccessSnackbarIsOpen] = useState<boolean>(false);
  const stepItemsRef = useRef<StepperStep[]>([]);
  const { Config } = useConfig();

  const raffleBingoStepFiles = ["raffle-license-step-1", "raffle-license-step-2"];

  const getRaffleBingoStep = async (stepIndex: number): Promise<Task> => {
    const fileName = raffleBingoStepFiles[stepIndex];
    return await fetchTaskByFilename(fileName);
  };

  useEffect(() => {
    getRaffleBingoStep(stepIndex).then((step) => {
      setStep(step);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const getStepLabels = async (): Promise<StepperStep[]> => {
    const labels = await Promise.all(
      raffleBingoStepFiles.map(async (fileName) => {
        const step = await fetchTaskByFilename(fileName);
        return { name: step.stepLabel ?? "" };
      })
    );
    return labels;
  };

  useEffect(() => {
    const getStepItems = async (): Promise<void> => {
      const stepItems = await getStepLabels();
      stepItemsRef.current = stepItems;
    };
    getStepItems();
  });

  const isFirstStep = (stepIndex: number): boolean => {
    return stepIndex === 0;
  };

  const isLastStep = (stepIndex: number): boolean => {
    return stepIndex === raffleBingoStepFiles.length - 1;
  };

  const onMoveToStep = (stepIndex: number): void => {
    setStepIndex(stepIndex);
  };

  const markTaskAsComplete = (): void => {
    if (!business || !updateQueue) return;
    const completed: TaskProgress = "COMPLETED";
    updateQueue.queueTaskProgress({ [props.task.id]: completed });
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

  const agencyName = step?.agencyId ? LookupTaskAgencyById(step.agencyId).name : "";

  return (
    <>
      <TaskHeader task={props.task} />
      <Content>{step?.summaryDescriptionMd ?? ""}</Content>
      {stepItemsRef.current.length > 0 ? (
        <HorizontalStepper
          steps={stepItemsRef.current}
          currentStep={stepIndex}
          onStepClicked={(step: number): void => {
            onMoveToStep(step);
          }}
        />
      ) : (
        <div>Loading...</div>
      )}
      <div data-testid={step?.filename}>
        <Content>{step?.contentMd ?? ""}</Content>
        <div className="margin-bottom-4 margin-left-2">
          <SingleCtaLink
            link={step?.callToActionLink ?? ""}
            text={step?.callToActionText}
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
        {agencyName}
      </div>

      <div>
        <CtaContainer>
          <ActionBarLayout>
            {!isLastStep(stepIndex) && (
              <PrimaryButton
                isColor="primary"
                onClick={(): void => {
                  onMoveToStep(stepIndex + 1);
                }}
                dataTestId="continue-button"
                isRightMarginRemoved={true}
              >
                {Config.taskDefaults.continueButtonText}
              </PrimaryButton>
            )}
            {!isFirstStep(stepIndex) && (
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
            {isLastStep(stepIndex) && (
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

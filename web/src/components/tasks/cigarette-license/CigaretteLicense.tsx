import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { TaskHeader } from "@/components/TaskHeader";
import { CigaretteLicenseStepOne } from "@/components/tasks/cigarette-license/CigaretteLicenseStepOne";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { StepperStep, Task } from "@/lib/types/types";
import { ReactElement } from "react";

type Props = {
  task: Task;
};

export const CigaretteLicense = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const stepperSteps: StepperStep[] = [
    {
      name: Config.cigaretteLicenseShared.stepperOneLabel,
      hasError: false,
      isComplete: false,
    },
    {
      name: Config.cigaretteLicenseShared.stepperTwoLabel,
      hasError: false,
      isComplete: false,
    },
    {
      name: Config.cigaretteLicenseShared.stepperThreeLabel,
      hasError: false,
      isComplete: false,
    },
    {
      name: Config.cigaretteLicenseShared.stepperFourLabel,
      hasError: false,
      isComplete: false,
    },
  ];
  return (
    <>
      <TaskHeader task={props.task} />
      <HorizontalStepper
        steps={stepperSteps}
        currentStep={0}
        onStepClicked={function (step: number): void {
          throw new Error(`Function ${step} not implemented.`);
        }}
      />
      <CigaretteLicenseStepOne />
      <HorizontalLine />
      <span className="h5-styling">{Config.cigaretteLicenseShared.issuingAgencyLabelText}: </span>
      <span className="h6-styling">{Config.cigaretteLicenseShared.issuingAgencyText}</span>
      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton />
          <PrimaryButton
            isColor="primary"
            onClick={() => {}}
            dataTestId="cta-primary-1"
            isRightMarginRemoved={true}
          >
            {Config.cigaretteLicenseStep1.continueButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};

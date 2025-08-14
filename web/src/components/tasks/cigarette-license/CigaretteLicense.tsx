import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { TaskHeader } from "@/components/TaskHeader";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { GeneralInfo } from "@/components/tasks/cigarette-license/GeneralInfo";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { StepperStep, Task } from "@/lib/types/types";
import { ReactElement, useState } from "react";
import { ConfirmationPage } from "@/components/tasks/cigarette-license/Confirmation";

type Props = {
  task: Task;
  CMS_ONLY_stepIndex?: number;
};

export const CigaretteLicense = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const { business } = useUserData();

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

  if (
    business?.cigaretteLicenseData?.paymentInfo?.orderId &&
    business?.cigaretteLicenseData?.paymentInfo?.confirmationEmailsent
  ) {
    return (
      <div className="flex flex-column space-between min-height-38rem">
        <TaskHeader task={props.task} />
        <ConfirmationPage business={business} />
      </div>
    );
  }

  return (
    <>
      <TaskHeader task={props.task} />
      <HorizontalStepper
        steps={stepperSteps}
        currentStep={stepIndex}
        onStepClicked={function (step: number): void {
          setStepIndex(step);
        }}
      />
      {stepIndex === 0 && <GeneralInfo setStepIndex={setStepIndex} />}
    </>
  );
};

import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { TaskHeader } from "@/components/TaskHeader";
import { LicenseeInfo } from "@/components/tasks/cigarette-license/LicenseeInfo";
import { GeneralInfo } from "@/components/tasks/cigarette-license/GeneralInfo";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { StepperStep, Task } from "@/lib/types/types";
import { ReactElement, useState } from "react";
import { createDataFormErrorMap, DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";

type Props = {
  task: Task;
  CMS_ONLY_stepIndex?: number;
};

export const CigaretteLicense = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());

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
        currentStep={stepIndex}
        onStepClicked={function (step: number): void {
          setStepIndex(step);
        }}
      />
      <DataFormErrorMapContext.Provider value={formContextState}>
        {stepIndex === 0 && <GeneralInfo setStepIndex={setStepIndex} />}
        {stepIndex === 1 && <LicenseeInfo setStepIndex={setStepIndex} />}
      </DataFormErrorMapContext.Provider>
    </>
  );
};

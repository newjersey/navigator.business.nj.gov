import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { EmergencyTripPermitSteps } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitSteps";
import { EmergencyTripPermitStepsConfiguration } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitStepsConfiguration";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { createDataFormErrorMap, DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { StepperStep } from "@/lib/types/types";
import {
  EmergencyTripPermitApplicationInfo,
  generateEmptyEmergencyTripPermitData,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { ReactElement, useState } from "react";
export const EmergencyTripPermit = (): ReactElement => {
  const { Config } = useConfig();
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [applicationInfo, setApplicationInfo] = useState<EmergencyTripPermitApplicationInfo>(
    generateEmptyEmergencyTripPermitData()
  );
  const steps: StepperStep[] = EmergencyTripPermitStepsConfiguration.map((step) => {
    return { name: step.name, hasError: false };
  });

  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());

  const getNextStepText = (): string => {
    switch (stepIndex) {
      case 4:
        return Config.abcEmergencyTripPermit.submitText;
      default:
        return Config.abcEmergencyTripPermit.nextStepText;
    }
  };

  return (
    <EmergencyTripPermitContext.Provider
      value={{
        state: {
          stepIndex,
          applicationInfo,
        },
        setStepIndex: setStepIndex,
        setApplicationInfo: setApplicationInfo,
      }}
    >
      <DataFormErrorMapContext.Provider value={formContextState}>
        <div
          className={`bg-base-extra-light margin-x-neg-4 margin-top-neg-4 padding-x-4 padding-bottom-2 padding-top-4 margin-bottom-2 radius-top-lg`}
        >
          <h1> {Config.abcEmergencyTripPermit.taskName}</h1>
        </div>
        <HorizontalStepper
          currentStep={stepIndex}
          onStepClicked={(newStep) => {
            setStepIndex(newStep);
          }}
          steps={steps}
        />
        {EmergencyTripPermitSteps[stepIndex].component}
        <CtaContainer>
          <ActionBarLayout>
            {stepIndex !== 0 && (
              <SecondaryButton
                onClick={() => {
                  setStepIndex(stepIndex - 1);
                }}
                isColor={"primary"}
              >
                {Config.abcEmergencyTripPermit.previousStepText}
              </SecondaryButton>
            )}

            <PrimaryButton
              isColor="primary"
              onClick={(): void => {
                if (stepIndex < 4) {
                  setStepIndex(stepIndex + 1);
                }
              }}
              isRightMarginRemoved={true}
              dataTestId="next-button"
            >
              {getNextStepText()}
            </PrimaryButton>
          </ActionBarLayout>
        </CtaContainer>
      </DataFormErrorMapContext.Provider>
    </EmergencyTripPermitContext.Provider>
  );
};

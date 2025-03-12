import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { EmergencyTripPermitSteps } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitSteps";
import { EmergencyTripPermitStepsConfiguration } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitStepsConfiguration";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { createProfileFieldErrorMap, ProfileFormContext } from "@/contexts/profileFormContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { StepperStep } from "@/lib/types/types";
import {
  EmergencyTripPermitApplicationInfo,
  generateEmptyEmergencyTripPermitData,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { ReactElement, useState } from "react";
export const EmergencyTripPermit = (): ReactElement => {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [applicationInfo, setApplicationInfo] = useState<EmergencyTripPermitApplicationInfo>(
    generateEmptyEmergencyTripPermitData()
  );
  const steps: StepperStep[] = EmergencyTripPermitStepsConfiguration.map((step) => {
    return { name: step.name, hasError: false };
  });

  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());

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
      <ProfileFormContext.Provider value={formContextState}>
        <div className="padding-bottom-4 margin-x-4 bg-accent-cool-lightest">
          <h1>Test Name</h1>
        </div>
        <HorizontalStepper
          currentStep={stepIndex}
          onStepClicked={(newStep) => {
            setStepIndex(newStep);
          }}
          steps={steps}
        />
        {EmergencyTripPermitSteps[stepIndex].component}
      </ProfileFormContext.Provider>
    </EmergencyTripPermitContext.Provider>
  );
};

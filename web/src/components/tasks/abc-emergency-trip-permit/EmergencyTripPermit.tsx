import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { EmergencyTripPermitSteps } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitSteps";
import {
  doesStepHaveError,
  EmergencyTripPermitStepsConfiguration,
  isStepComplete,
} from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitStepsConfiguration";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { createDataFormErrorMap, DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { StepperStep } from "@/lib/types/types";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitFieldNames,
  generateNewEmergencyTripPermitData,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { ReactElement, useState } from "react";
export const EmergencyTripPermit = (): ReactElement => {
  const { Config } = useConfig();
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [applicationInfo, setApplicationInfo] = useState<EmergencyTripPermitApplicationInfo>(
    generateNewEmergencyTripPermitData()
  );
  const { state: formContextState, getInvalidFieldIds } = useFormContextHelper(createDataFormErrorMap());

  const invalidFieldIds = getInvalidFieldIds() as EmergencyTripPermitFieldNames[];
  const steps: StepperStep[] = EmergencyTripPermitStepsConfiguration.map((step) => {
    return {
      name: step.name,
      hasError: doesStepHaveError(step.name, invalidFieldIds),
      isComplete: isStepComplete(step.name, invalidFieldIds),
    };
  });

  const prePopulateFormFieldsForBillingPage = (): void => {
    setApplicationInfo({
      ...applicationInfo,
      payerFirstName: applicationInfo.payerFirstName ?? applicationInfo.requestorFirstName,
      payerLastName: applicationInfo.payerLastName ?? applicationInfo.requestorLastName,
      payerEmail: applicationInfo.payerEmail ?? applicationInfo.requestorEmail,
      payerPhoneNumber: applicationInfo.payerPhoneNumber ?? applicationInfo.requestorPhone,
      payerCountry: applicationInfo.payerCountry ?? applicationInfo.requestorCountry,
      payerAddress1: applicationInfo.payerAddress1 ?? applicationInfo.requestorAddress1,
      payerAddress2: applicationInfo.payerAddress2 ?? applicationInfo.requestorAddress2,
      payerCity: applicationInfo.payerCity ?? applicationInfo.requestorCity,
      payerStateAbbreviation:
        applicationInfo.payerStateAbbreviation ?? applicationInfo.requestorStateProvince,
      payerZipCode: applicationInfo.payerZipCode ?? applicationInfo.requestorZipPostalCode,
      payerCompanyName: applicationInfo.payerCompanyName ?? applicationInfo.payerCompanyName,
    });
  };

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
        setStepIndex,
        setApplicationInfo,
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
            if (stepIndex === 1) {
              prePopulateFormFieldsForBillingPage();
            }
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
                if (stepIndex === 1) {
                  prePopulateFormFieldsForBillingPage();
                }
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

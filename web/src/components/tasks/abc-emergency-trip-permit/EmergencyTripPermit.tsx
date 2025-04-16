import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { getErrorStateForEmergencyTripPermitField } from "@/components/tasks/abc-emergency-trip-permit/fields/getErrorStateForEmergencyTripPermitField";
import { EmergencyTripPermitSteps } from "@/components/tasks/abc-emergency-trip-permit/steps/EmergencyTripPermitSteps";
import {
  doesStepHaveError,
  EmergencyTripPermitStepsConfiguration,
  isStepComplete,
} from "@/components/tasks/abc-emergency-trip-permit/steps/EmergencyTripPermitStepsConfiguration";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  EmergencyTripPermitFieldErrorState,
  FieldStateActionKind,
  ReducedFieldStates,
  StepperStep,
} from "@/lib/types/types";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitFieldNames,
  generateNewEmergencyTripPermitData,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { ReactElement, useContext, useState } from "react";

export const EmergencyTripPermit = (): ReactElement => {
  const { Config } = useConfig();
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [applicationInfo, setApplicationInfo] = useState<EmergencyTripPermitApplicationInfo>(
    generateNewEmergencyTripPermitData()
  );
  const [submitted, setSubmitted] = useState(false);
  const dataFormErrorMapContext = useContext(DataFormErrorMapContext);

  const getInvalidFieldIds = (): string[] => {
    return Object.keys(dataFormErrorMapContext.fieldStates).filter((field: string) => {
      const fieldName = field as keyof EmergencyTripPermitApplicationInfo;
      const fieldStates = dataFormErrorMapContext.fieldStates as ReducedFieldStates<
        EmergencyTripPermitFieldNames,
        EmergencyTripPermitFieldErrorState
      >;
      return fieldStates[fieldName].invalid;
    });
  };

  const invalidFieldIds = getInvalidFieldIds() as EmergencyTripPermitFieldNames[];
  const steps: StepperStep[] = EmergencyTripPermitStepsConfiguration.map((step) => {
    return {
      name: step.name,
      hasError: submitted ? doesStepHaveError(step.name, invalidFieldIds) : undefined,
      isComplete: submitted ? isStepComplete(step.name, invalidFieldIds) : undefined,
    };
  });

  const validateAllRequiredFields = (): void => {
    for (const key of Object.keys(applicationInfo)) {
      const fieldName = key as EmergencyTripPermitFieldNames;
      const hasError = getErrorStateForEmergencyTripPermitField(fieldName, applicationInfo).hasError;
      dataFormErrorMapContext.reducer({
        type: FieldStateActionKind.VALIDATION,
        payload: { field: fieldName, invalid: hasError },
      });
    }
  };

  const prePopulateFormFieldsForBillingPage = (): void => {
    setApplicationInfo({
      ...applicationInfo,
      payerFirstName:
        applicationInfo.payerFirstName === ""
          ? applicationInfo.requestorFirstName
          : applicationInfo.payerFirstName,
      payerLastName:
        applicationInfo.payerLastName === ""
          ? applicationInfo.requestorLastName
          : applicationInfo.payerLastName,
      payerEmail:
        applicationInfo.payerEmail === "" ? applicationInfo.requestorEmail : applicationInfo.payerEmail,
      payerPhoneNumber:
        applicationInfo.payerPhoneNumber === ""
          ? applicationInfo.requestorPhone
          : applicationInfo.payerPhoneNumber,
      payerCountry:
        applicationInfo.payerCountry === "" ? applicationInfo.requestorCountry : applicationInfo.payerCountry,
      payerAddress1:
        applicationInfo.payerAddress1 === ""
          ? applicationInfo.requestorAddress1
          : applicationInfo.payerAddress1,
      payerAddress2:
        applicationInfo.payerAddress2 === ""
          ? applicationInfo.requestorAddress2
          : applicationInfo.payerAddress2,
      payerCity: applicationInfo.payerCity === "" ? applicationInfo.requestorCity : applicationInfo.payerCity,
      payerStateAbbreviation:
        applicationInfo.payerZipCode === ""
          ? applicationInfo.requestorStateProvince
          : applicationInfo.payerStateAbbreviation,
      payerZipCode:
        applicationInfo.payerZipCode === ""
          ? applicationInfo.requestorZipPostalCode
          : applicationInfo.payerZipCode,
      payerCompanyName:
        applicationInfo.payerCompanyName === "" ? applicationInfo.carrier : applicationInfo.payerCompanyName,
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
          submitted,
        },
        setStepIndex,
        setApplicationInfo,
        setSubmitted,
      }}
    >
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
              dataTestId={"back-button"}
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
              if (stepIndex === 4) {
                setSubmitted(true);
                validateAllRequiredFields();
              }
            }}
            isRightMarginRemoved={true}
            dataTestId="next-button"
          >
            {getNextStepText()}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </EmergencyTripPermitContext.Provider>
  );
};

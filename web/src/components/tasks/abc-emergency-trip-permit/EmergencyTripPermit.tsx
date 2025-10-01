import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
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
import { postEmergencyTripPermitApplication } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { scrollToTop } from "@/lib/utils/helpers";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitFieldNames,
  generateNewEmergencyTripPermitData,
} from "@businessnjgovnavigator/shared";
import {
  EmergencyTripPermitFieldErrorState,
  FieldStateActionKind,
  ReducedFieldStates,
  StepperStep,
} from "@businessnjgovnavigator/shared/types";
import { useRouter } from "next/compat/router";
import { ReactElement, useContext, useState } from "react";

export const EmergencyTripPermit = (): ReactElement => {
  const { Config } = useConfig();
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [applicationInfo, setApplicationInfo] = useState<EmergencyTripPermitApplicationInfo>(
    generateNewEmergencyTripPermitData(),
  );
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState(false);
  const dataFormErrorMapContext = useContext(DataFormErrorMapContext);
  const router = useRouter();

  const getInvalidFieldIds = (): EmergencyTripPermitFieldNames[] => {
    return Object.keys(dataFormErrorMapContext.fieldStates).filter((field: string) => {
      const fieldName = field as keyof EmergencyTripPermitApplicationInfo;
      const fieldStates = dataFormErrorMapContext.fieldStates as ReducedFieldStates<
        EmergencyTripPermitFieldNames,
        EmergencyTripPermitFieldErrorState
      >;
      return fieldStates[fieldName].invalid;
    }) as EmergencyTripPermitFieldNames[];
  };

  const steps: StepperStep[] = EmergencyTripPermitStepsConfiguration.map((step) => {
    const invalidFieldIds = getInvalidFieldIds();
    return {
      name: step.name,
      hasError: submitted ? doesStepHaveError(step.name, invalidFieldIds) : undefined,
      isComplete: submitted ? isStepComplete(step.name, invalidFieldIds) : undefined,
    };
  });

  const validateAllRequiredFields = (): boolean => {
    let hasErrorFields = false;
    for (const key of Object.keys(applicationInfo)) {
      const fieldName = key as EmergencyTripPermitFieldNames;
      const hasError = getErrorStateForEmergencyTripPermitField(
        fieldName,
        applicationInfo,
      ).hasError;
      hasErrorFields = hasErrorFields || hasError;
      dataFormErrorMapContext.reducer({
        type: FieldStateActionKind.VALIDATION,
        payload: { field: fieldName, invalid: hasError },
      });
    }
    return hasErrorFields;
  };

  const prePopulateFormFieldsForBillingPage = (): void => {
    const billingFieldsToValidate: {
      payerFieldName: EmergencyTripPermitFieldNames;
      requestorFieldName: EmergencyTripPermitFieldNames;
    }[] = [
      { payerFieldName: "payerFirstName", requestorFieldName: "requestorFirstName" },
      { payerFieldName: "payerLastName", requestorFieldName: "requestorLastName" },
      { payerFieldName: "payerEmail", requestorFieldName: "requestorEmail" },
      { payerFieldName: "payerPhoneNumber", requestorFieldName: "requestorPhone" },
      { payerFieldName: "payerCountry", requestorFieldName: "requestorCountry" },
      { payerFieldName: "payerAddress1", requestorFieldName: "requestorAddress1" },
      { payerFieldName: "payerAddress2", requestorFieldName: "requestorAddress2" },
      { payerFieldName: "payerCity", requestorFieldName: "requestorCity" },
      { payerFieldName: "payerStateAbbreviation", requestorFieldName: "requestorStateProvince" },
      { payerFieldName: "payerZipCode", requestorFieldName: "requestorZipPostalCode" },
      { payerFieldName: "payerCompanyName", requestorFieldName: "carrier" },
    ];
    let newApplicationInfo = { ...applicationInfo };
    for (const fields of billingFieldsToValidate) {
      if (newApplicationInfo[fields.payerFieldName] === "") {
        newApplicationInfo = {
          ...newApplicationInfo,
          [fields.payerFieldName]: newApplicationInfo[fields.requestorFieldName],
        };

        if (newApplicationInfo[fields.requestorFieldName] !== "") {
          dataFormErrorMapContext.reducer({
            type: FieldStateActionKind.VALIDATION,
            payload: {
              field: fields.payerFieldName,
              invalid: getErrorStateForEmergencyTripPermitField(
                fields.payerFieldName,
                newApplicationInfo,
              ).hasError,
            },
          });
        }
      }
    }
    setApplicationInfo(newApplicationInfo);
  };

  const getNextStepText = (): string => {
    switch (stepIndex) {
      case 4:
        return Config.abcEmergencyTripPermit.submitText;
      default:
        return Config.abcEmergencyTripPermit.nextStepText;
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setApiError(false);
    await postEmergencyTripPermitApplication(applicationInfo)
      .then((response) => {
        if ("Success" in response) {
          router?.push(response.PayUrl.RedirectToUrl);
        }
      })
      .catch(() => {
        setApiError(true);
        scrollToTop({ smooth: true });
      });
  };

  return (
    <EmergencyTripPermitContext.Provider
      value={{
        state: {
          stepIndex,
          applicationInfo,
          submitted,
          apiError,
        },
        setStepIndex,
        setApplicationInfo,
        setSubmitted,
        setApiError,
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
          <LiveChatHelpButton
            analyticsEvent={analytics.event.emergency_trip_permit_help_button.click.open_live_chat}
          />
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
            onClick={async (): Promise<void> => {
              if (stepIndex === 1) {
                prePopulateFormFieldsForBillingPage();
              }
              if (stepIndex < 4) {
                setStepIndex(stepIndex + 1);
              }
              if (stepIndex === 4) {
                setSubmitted(true);
                const hasErrorFields = validateAllRequiredFields();
                if (hasErrorFields) {
                  scrollToTop({ smooth: true });
                } else {
                  await handleSubmit();
                }
              }
            }}
            isRightMarginRemoved={true}
          >
            {getNextStepText()}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </EmergencyTripPermitContext.Provider>
  );
};

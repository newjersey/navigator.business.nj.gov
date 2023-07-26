import { AutosaveSpinner } from "@/components/AutosaveSpinner";
import { Alert } from "@/components/njwds-extended/Alert";
import { HelpButton } from "@/components/njwds-extended/HelpButton";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { BusinessFormationSteps } from "@/components/tasks/business-formation/BusinessFormationSteps";
import {
  BusinessFormationStepsConfiguration,
  LookupNameByStepIndex,
} from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import {
  getFieldByApiField,
  UNKNOWN_API_ERROR_FIELD,
} from "@/components/tasks/business-formation/getFieldForApiField";
import { validatedFieldsForUser } from "@/components/tasks/business-formation/validatedFieldsForUser";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { FormationStepNames, StepperStep } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { scrollToTopOfElement, useMountEffect } from "@/lib/utils/helpers";
import { Business, FormationFormData, getCurrentBusiness } from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, ReactNode, useContext, useEffect, useRef, useState } from "react";

export const BusinessFormationPaginator = (): ReactElement => {
  const { updateQueue, business } = useUserData();
  const { state, setStepIndex, setHasBeenSubmitted, setFormationFormData, setFieldsInteracted } =
    useContext(BusinessFormationContext);
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);
  const { Config } = useConfig();
  const { doesStepHaveError, isStepCompleted, allCurrentErrorsForStep, getApiErrorMessage } =
    useFormationErrors();
  const currentStepName = LookupNameByStepIndex(state.stepIndex);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const stepperRef = useRef<HTMLDivElement>(null);
  const errorAlertRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);
  const isDesktop = useMediaQuery(MediaQueries.desktopAndUp);

  useEffect(() => {
    if (isMounted.current) {
      const element = state.hasBeenSubmitted ? errorAlertRef.current : stepperRef.current;
      scrollToTopOfElement(element, { isDesktop });
    }
  }, [state.stepIndex, isDesktop, state.hasBeenSubmitted]);

  useMountEffect(() => {
    if (!business) return;
    if (
      business.formationData.lastVisitedPageIndex > BusinessFormationStepsConfiguration.length - 1 ||
      business.formationData.lastVisitedPageIndex < 0
    ) {
      setStepIndex(0);
    } else {
      setStepIndex(business.formationData.lastVisitedPageIndex);
    }
  });

  useMountEffect(() => {
    isMounted.current = true;
    scrollToTopOfElement(stepperRef.current, { isDesktop });
    analytics.event.business_formation_name_step.arrive.arrive_on_business_formation_name_step();
  });

  const determineStepsWithErrors = (overrides?: {
    hasSubmitted: boolean;
  }): { stepsWithErrors: StepperStep[]; stepStates: StepperStep[] } => {
    const stepStates = BusinessFormationStepsConfiguration.map((value) => {
      return {
        name: value.name,
        hasError: doesStepHaveError(value.name, overrides),
        isComplete: isStepCompleted(value.name),
      };
    });

    const stepsWithErrors = stepStates.filter((stepState) => {
      return stepState.hasError;
    });
    return { stepsWithErrors, stepStates };
  };

  const { stepsWithErrors, stepStates } = determineStepsWithErrors();

  const moveToStep = (stepIndex: number): void => {
    setStepIndex(stepIndex);
  };

  const isStep = (stepName: FormationStepNames): boolean => {
    return currentStepName === stepName;
  };

  const onPreviousButtonClick = (): void => {
    onMoveToStep(state.stepIndex - 1, { moveType: "PREVIOUS_BUTTON" });
  };

  const onMoveToStep = (
    stepIndex: number,
    config: { moveType: "PREVIOUS_BUTTON" | "NEXT_BUTTON" | "STEPPER" }
  ): void => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setRegistrationModalIsVisible(true);
      return;
    }

    const isSubmittingFromFinalStep = stepIndex >= BusinessFormationStepsConfiguration.length;

    if (isSubmittingFromFinalStep) {
      setHasBeenSubmitted(true);
      const { stepsWithErrors } = determineStepsWithErrors({ hasSubmitted: true });
      if (stepsWithErrors.length > 0) {
        scrollToTopOfElement(errorAlertRef.current, { isDesktop });
        return;
      }
      submitToApi();
      return;
    }

    saveFormData({ shouldFilter: true, newStep: stepIndex });

    onStepChangeAnalytics(stepIndex, config.moveType);
    moveToStep(stepIndex);
  };

  const saveFormData = ({ shouldFilter, newStep }: { shouldFilter: boolean; newStep: number }): void => {
    if (!updateQueue) return;
    let formationFormDataToSave = { ...state.formationFormData };
    if (shouldFilter) {
      formationFormDataToSave = filterEmptyFormData(state.formationFormData);
    }

    updateQueue.queueFormationData({
      formationFormData: formationFormDataToSave,
      businessNameAvailability: state.businessNameAvailability,
      lastVisitedPageIndex: newStep,
    });

    queueFormationChangesInProfile();
    updateQueue.update();
  };

  const queueFormationChangesInProfile = (): void => {
    if (!updateQueue) return;

    if (isStep("Business")) {
      const muncipalityEnteredForFirstTime =
        updateQueue.currentBusiness().profileData.municipality === undefined &&
        updateQueue.currentBusiness().formationData.formationFormData.addressMunicipality !== undefined;

      if (muncipalityEnteredForFirstTime) {
        analytics.event.business_formation_location_question.submit.location_entered_for_first_time();
      }

      updateQueue.queueProfileData({
        municipality: updateQueue.currentBusiness().formationData.formationFormData.addressMunicipality,
      });
    }

    if (
      isStep("Name") &&
      updateQueue.currentBusiness().formationData.businessNameAvailability?.status === "AVAILABLE"
    ) {
      updateQueue.queueProfileData({
        businessName: updateQueue.currentBusiness().formationData.formationFormData.businessName,
      });
    }
  };

  const filterEmptyFormData = (formationFormData: FormationFormData): FormationFormData => {
    let formationFormDataToSubmit = { ...formationFormData };

    if (isStep("Business")) {
      const filteredProvisions = formationFormData.provisions?.filter((it) => {
        return it !== "";
      });
      formationFormDataToSubmit = { ...formationFormDataToSubmit, provisions: filteredProvisions };
    }

    if (isStep("Contacts")) {
      const filteredSigners = formationFormData.signers?.filter((it) => {
        return !!it;
      });
      const filteredIncorporators = formationFormData.incorporators?.filter((it) => {
        return !!it;
      });

      formationFormDataToSubmit = {
        ...formationFormDataToSubmit,
        signers: filteredSigners,
        incorporators: filteredIncorporators,
      };
    }

    setFormationFormData(formationFormDataToSubmit);
    return formationFormDataToSubmit;
  };

  const onStepChangeAnalytics = (
    nextStepIndex: number,
    moveType: "PREVIOUS_BUTTON" | "NEXT_BUTTON" | "STEPPER"
  ): void => {
    if (moveType === "STEPPER") {
      if (LookupNameByStepIndex(nextStepIndex) === "Name") {
        analytics.event.business_formation_name_tab.click.arrive_on_business_formation_name_step();
      }
      if (LookupNameByStepIndex(nextStepIndex) === "Business") {
        analytics.event.business_formation_business_tab.click.arrive_on_business_formation_business_step();
      }
      if (LookupNameByStepIndex(nextStepIndex) === "Contacts") {
        analytics.event.business_formation_contacts_tab.click.arrive_on_business_formation_contacts_step();
      }
      if (LookupNameByStepIndex(nextStepIndex) === "Billing") {
        analytics.event.business_formation_billing_tab.click.arrive_on_business_formation_billing_step();
      }
      if (LookupNameByStepIndex(nextStepIndex) === "Review") {
        analytics.event.business_formation_review_tab.click.arrive_on_business_formation_review_step();
      }
    }

    if (moveType === "NEXT_BUTTON") {
      if (isStep("Name")) {
        analytics.event.business_formation_name_step_continue_button.click.arrive_on_business_formation_business_step();
      }
      if (isStep("Business")) {
        analytics.event.business_formation_business_step_continue_button.click.arrive_on_business_formation_contacts_step();
      }
      if (isStep("Contacts")) {
        analytics.event.business_formation_contacts_step_continue_button.click.arrive_on_business_formation_billing_step();
      }
      if (isStep("Billing")) {
        analytics.event.business_formation_billing_step_continue_button.click.arrive_on_business_formation_review_step();
      }
    }
  };

  const submitToApiAnalytics = (business: Business): void => {
    const { formationFormData } = business.formationData;

    analytics.event.business_formation_provisions.submit.provisions_submitted_with_formation(
      formationFormData.provisions?.length ?? 0
    );

    if (formationFormData.businessPurpose.trim().length > 0) {
      analytics.event.business_formation_purpose.submit.purpose_submitted_with_formation();
    }

    analytics.event.business_formation_members.submit.members_submitted_with_formation(
      formationFormData.members?.length ?? 0
    );
    analytics.event.business_formation_signers.submit.signers_submitted_with_formation(
      formationFormData.signers?.length ?? formationFormData.incorporators?.length ?? 0
    );
    if (formationFormData.agentNumberOrManual === "NUMBER") {
      analytics.event.business_formation_registered_agent_identification.submit.entered_agent_ID();
    } else if (formationFormData.agentNumberOrManual === "MANUAL_ENTRY") {
      analytics.event.business_formation_registered_agent_identification.submit.identified_agent_manually();
      if (formationFormData.agentUseBusinessAddress) {
        analytics.event.business_formation_registered_agent_manual_address.submit.address_is_same_as_account_holder();
      }
      if (formationFormData.agentUseAccountInfo) {
        analytics.event.business_formation_registered_agent_manual_name.submit.name_is_same_as_account_holder();
      }
    }
  };

  const submitToApi = async (): Promise<void> => {
    if (!business || !updateQueue) return;
    updateQueue.queueFormationData({
      formationFormData: filterEmptyFormData(state.formationFormData),
    });

    setIsLoading(true);

    const newUserData = await api.postBusinessFormation(
      updateQueue.current(),
      window.location.href,
      state.foreignGoodStandingFile
    );
    updateQueue.queue(newUserData).update();
    const newBusiness = getCurrentBusiness(newUserData);
    submitToApiAnalytics(newBusiness);
    resetInteractedFields(newBusiness);

    if (
      newBusiness.formationData.formationResponse?.success &&
      newBusiness.formationData.formationResponse?.redirect
    ) {
      analytics.event.business_formation.submit.go_to_NIC_formation_processing();
      await router.replace(newBusiness.formationData.formationResponse.redirect);
    } else {
      analytics.event.business_formation.submit.error_remain_at_formation();
      setIsLoading(false);
    }
  };

  const resetInteractedFields = (business: Business): void => {
    const validatedFields = validatedFieldsForUser(business.formationData.formationFormData);
    setFieldsInteracted(validatedFields, { setToUninteracted: true });
  };

  const shouldDisplayPreviousButton = (): boolean => {
    return state.stepIndex !== 0;
  };

  const getNextButtonText = (): string => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return `Register & ${Config.formation.general.initialNextButtonText}`;
    } else if (state.stepIndex === 0) {
      return Config.formation.general.initialNextButtonText;
    } else if (state.stepIndex === BusinessFormationStepsConfiguration.length - 1) {
      return Config.formation.general.submitButtonText;
    } else {
      return Config.formation.general.nextButtonText;
    }
  };

  const hasFormDataChanged = (): boolean => {
    if (!updateQueue || !state.hasSetStateFirstTime) return false;

    return (
      JSON.stringify(updateQueue.currentBusiness().formationData.formationFormData) !==
        JSON.stringify(state.formationFormData) ||
      JSON.stringify(updateQueue.currentBusiness().formationData.businessNameAvailability) !==
        JSON.stringify(state.businessNameAvailability)
    );
  };

  const displayButtons = (): ReactNode => {
    return (
      <div className="margin-top-2 ">
        <div className="flex fdc mobile-lg:flex-row fac bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 margin-bottom-neg-4 radius-bottom-lg">
          <div className="flex fac margin-bottom-2 mobile-lg:margin-bottom-0">
            <AutosaveSpinner
              saveEveryXSeconds={1}
              secondsBetweenSpinAnimations={60}
              spinForXSeconds={2.5}
              hasDataChanged={hasFormDataChanged()}
              saveDataFunction={(): void => {
                saveFormData({ shouldFilter: false, newStep: state.stepIndex });
              }}
            />
          </div>
          <div className="flex mobile-lg:fac flex-column-reverse mobile-lg:flex-row flex-justify-end width-100">
            <HelpButton />

            {shouldDisplayPreviousButton() && (
              <div className="margin-top-1 mobile-lg:margin-top-0 mobile-lg:margin-right-105">
                <SecondaryButton
                  isColor="primary"
                  onClick={onPreviousButtonClick}
                  dataTestId="previous-button"
                  isRightMarginRemoved={true}
                >
                  {Config.formation.general.previousButtonText}
                </SecondaryButton>
              </div>
            )}

            <div>
              <PrimaryButton
                isColor="primary"
                onClick={(): void => {
                  onMoveToStep(state.stepIndex + 1, { moveType: "NEXT_BUTTON" });
                }}
                isRightMarginRemoved={true}
                isLoading={isLoading}
                dataTestId="next-button"
              >
                {getNextButtonText()}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasGenericApiError = (): boolean => {
    const hasApiError =
      business?.formationData.formationResponse !== undefined &&
      business.formationData.formationResponse.errors.length > 0;

    if (!hasApiError) {
      return false;
    }

    const allApiErrorsHaveMappings = business.formationData.formationResponse.errors.every((error) => {
      return getFieldByApiField(error.field) !== UNKNOWN_API_ERROR_FIELD;
    });

    return !allApiErrorsHaveMappings;
  };

  const getErrorComponent = (): ReactNode => {
    if (hasGenericApiError()) {
      if (!business || !business.formationData.formationResponse) {
        return <></>;
      }
      return (
        <Alert variant="error">
          <div>{Config.formation.errorBanner.genericApiError}</div>
          <ul style={{ wordBreak: "break-word" }}>
            {business.formationData.formationResponse.errors.map((it) => {
              return (
                <li key={it.field}>
                  <span>{it.field}</span>
                  <span>{": "}</span>
                  <span>{it.message}</span>
                </li>
              );
            })}
          </ul>
          <div>{Config.formation.errorBanner.apiResubmitText}</div>
        </Alert>
      );
    }

    if (stepsWithErrors.length === 0) {
      return <></>;
    }

    if (isStep("Review")) {
      return (
        <Alert variant="error">
          <div>{Config.formation.errorBanner.incompleteStepsError}</div>
          <ul>
            {stepsWithErrors.map((stepState) => {
              const label = stepState.name;
              return <li key={label}>{label}</li>;
            })}
          </ul>
        </Alert>
      );
    }

    if (doesStepHaveError(currentStepName)) {
      const dedupedFieldErrors = allCurrentErrorsForStep(currentStepName).filter((value, index, self) => {
        return (
          index ===
          self.findIndex((error) => {
            return error.label === value.label;
          })
        );
      });

      return (
        <Alert variant="error">
          <div>{Config.formation.errorBanner.errorOnStep}</div>
          <ul>
            {dedupedFieldErrors.map((fieldError) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const label = (Config.formation.fields as any)[fieldError.field].label;
              return (
                <li key={label}>
                  {label}
                  {getApiErrorMessage(fieldError.field) && (
                    <ul>
                      <li>{getApiErrorMessage(fieldError.field)}</li>
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </Alert>
      );
    }

    return <></>;
  };

  return (
    <>
      <div ref={errorAlertRef}>{getErrorComponent()}</div>
      <div className="margin-top-3" ref={stepperRef}>
        <HorizontalStepper
          steps={stepStates}
          currentStep={state.stepIndex}
          onStepClicked={(step: number): void => {
            onMoveToStep(step, { moveType: "STEPPER" });
          }}
        />
      </div>
      <div className="fg1 flex flex-column space-between">
        {BusinessFormationSteps[state.stepIndex].component}
        {displayButtons()}
      </div>
    </>
  );
};

import { AutosaveSpinner } from "@/components/AutosaveSpinner";
import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { BusinessFormationSteps } from "@/components/tasks/business-formation/BusinessFormationSteps";
import {
  BusinessFormationStepsConfiguration,
  LookupNameByStepIndex,
} from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import {
  getFieldByApiField,
  UNKNOWN_API_ERROR_FIELD,
} from "@/components/tasks/business-formation/getFieldForApiField";
import { requiredFieldsForUser } from "@/components/tasks/business-formation/requiredFieldsForUser";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { FormationStepNames } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { scrollToTopOfElement, useMountEffect } from "@/lib/utils/helpers";
import { FormationFormData, FormationLegalType } from "@businessnjgovnavigator/shared/formationData";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";

export const BusinessFormationPaginator = (): ReactElement => {
  const { userData, update } = useUserData();
  const { state, setStepIndex, setHasBeenSubmitted, setFormationFormData, setFieldInteracted } =
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
    isMounted.current = true;
    analytics.event.business_formation_name_step.arrive.arrive_on_business_formation_name_step();
  });

  const determineStepsWithErrors = (overrides?: { hasSubmitted: boolean }) => {
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
    moveToStep(state.stepIndex - 1);
  };

  const onMoveToStep = (stepIndex: number, config: { moveType: "NEXT_BUTTON" | "STEPPER" }): void => {
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

    const savedUserData = saveFormData({ shouldFilter: true });

    onStepChangeAnalytics(savedUserData?.formationData.formationFormData, stepIndex, config.moveType);
    moveToStep(stepIndex);
  };

  const saveFormData = ({ shouldFilter }: { shouldFilter: boolean }): UserData | undefined => {
    if (!userData) return;
    let formationFormDataToSave = { ...state.formationFormData };
    if (shouldFilter) {
      formationFormDataToSave = filterEmptyFormData(state.formationFormData);
    }
    const userDataWithProfileChanges = updateChangesInProfileData({
      ...userData,
      formationData: {
        ...userData.formationData,
        formationFormData: formationFormDataToSave,
      },
    });
    update(userDataWithProfileChanges);
    return userDataWithProfileChanges;
  };

  const updateChangesInProfileData = (userData: UserData | undefined): UserData | undefined => {
    if (!userData) return;
    let userDataWithChanges = { ...userData };

    if (isStep("Business")) {
      const muncipalityEnteredForFirstTime =
        userDataWithChanges.profileData.municipality === undefined &&
        userDataWithChanges.formationData.formationFormData.addressMunicipality !== undefined;

      if (muncipalityEnteredForFirstTime) {
        analytics.event.business_formation_location_question.submit.location_entered_for_first_time();
      }

      userDataWithChanges = {
        ...userDataWithChanges,
        profileData: {
          ...userDataWithChanges.profileData,
          municipality: userDataWithChanges.formationData.formationFormData.addressMunicipality,
        },
      };
    }

    if (isStep("Name") && state.businessNameAvailability?.status === "AVAILABLE") {
      userDataWithChanges = {
        ...userDataWithChanges,
        profileData: {
          ...userDataWithChanges.profileData,
          businessName: userDataWithChanges.formationData.formationFormData.businessName,
        },
      };
    }

    return userDataWithChanges;
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
    formationFormData: FormationFormData | undefined,
    nextStepIndex: number,
    moveType: "NEXT_BUTTON" | "STEPPER"
  ) => {
    if (!formationFormData) {
      return;
    }

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

  const submitToApiAnalytics = (userData: UserData) => {
    const { formationFormData } = userData.formationData;

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

  const submitToApi = async () => {
    if (!userData) return;
    const filteredUserData = {
      ...userData,
      formationData: {
        ...userData.formationData,
        formationFormData: filterEmptyFormData(state.formationFormData),
      },
    };

    setIsLoading(true);

    const newUserData = await api.postBusinessFormation(filteredUserData, window.location.href);
    update(newUserData);
    submitToApiAnalytics(newUserData);
    resetInteractedFields(newUserData);

    if (
      newUserData.formationData.formationResponse?.success &&
      newUserData.formationData.formationResponse?.redirect
    ) {
      analytics.event.business_formation.submit.go_to_NIC_formation_processing();
      await router.replace(newUserData.formationData.formationResponse.redirect);
    } else {
      analytics.event.business_formation.submit.error_remain_at_formation();
      setIsLoading(false);
    }
  };

  const resetInteractedFields = (userData: UserData): void => {
    const requiredFields = requiredFieldsForUser(
      userData.profileData.legalStructureId as FormationLegalType,
      userData.formationData.formationFormData
    );
    for (const field of requiredFields) {
      setFieldInteracted(field, { setToUninteracted: true });
    }
  };

  const shouldDisplayPreviousButton = (): boolean => {
    return state.stepIndex !== 0;
  };

  const getNextButtonText = (): string => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return `Register & ${Config.businessFormationDefaults.initialNextButtonText}`;
    } else if (state.stepIndex === 0) {
      return Config.businessFormationDefaults.initialNextButtonText;
    } else if (state.stepIndex === BusinessFormationStepsConfiguration.length - 1) {
      return Config.businessFormationDefaults.submitButtonText;
    } else {
      return Config.businessFormationDefaults.nextButtonText;
    }
  };

  const hasFormDataChanged = (): boolean => {
    if (!userData || !state.hasSetStateFirstTime) return false;
    return (
      JSON.stringify(userData.formationData.formationFormData) !== JSON.stringify(state.formationFormData)
    );
  };

  const displayButtons = () => {
    return (
      <div className="margin-top-2 ">
        <div className="flex fdc mobile-lg:flex-row fac bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 margin-bottom-neg-4 radius-bottom-lg">
          <div className="flex fac margin-bottom-2 mobile-lg:margin-bottom-0">
            <AutosaveSpinner
              saveEveryXSeconds={1}
              secondsBetweenSpinAnimations={60}
              spinForXSeconds={2.5}
              hasDataChanged={hasFormDataChanged()}
              saveDataFunction={() => saveFormData({ shouldFilter: false })}
            />
          </div>
          <div className="flex flex-column-reverse mobile-lg:flex-row mobile-lg:margin-left-auto width-100">
            {shouldDisplayPreviousButton() && (
              <Button
                className="margin-top-1 mobile-lg:margin-top-0 mobile-lg:margin-right-1 mobile-lg:margin-left-auto"
                style="secondary"
                onClick={onPreviousButtonClick}
              >
                {Config.businessFormationDefaults.previousButtonText}
              </Button>
            )}
            <Button
              className={shouldDisplayPreviousButton() ? "" : "mobile-lg:margin-left-auto"}
              style="primary"
              onClick={() => {
                return onMoveToStep(state.stepIndex + 1, { moveType: "NEXT_BUTTON" });
              }}
              noRightMargin
              loading={isLoading}
              dataTestid="next-button"
            >
              {getNextButtonText()}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const hasGenericApiError = () => {
    const hasApiError =
      userData?.formationData.formationResponse !== undefined &&
      userData.formationData.formationResponse.errors.length > 0;

    if (!hasApiError) {
      return false;
    }

    const allApiErrorsHaveMappings = userData.formationData.formationResponse.errors.every((error) => {
      return getFieldByApiField(error.field) !== UNKNOWN_API_ERROR_FIELD;
    });

    return !allApiErrorsHaveMappings;
  };

  const getErrorComponent = () => {
    if (hasGenericApiError()) {
      if (!userData || !userData.formationData.formationResponse) {
        return <></>;
      }
      return (
        <Alert variant="error">
          <div>{Config.businessFormationDefaults.submitErrorHeading}</div>
          <ul style={{ wordBreak: "break-word" }}>
            {userData.formationData.formationResponse.errors.map((it) => {
              return (
                <li key={it.field}>
                  {it.field}
                  <ul>
                    <li>
                      <Content>{it.message}</Content>
                    </li>
                  </ul>
                </li>
              );
            })}
          </ul>
        </Alert>
      );
    }

    if (stepsWithErrors.length === 0) {
      return <></>;
    }

    if (isStep("Review")) {
      return (
        <Alert variant="error">
          <div>{Config.businessFormationDefaults.incompleteStepsOnSubmitText}</div>
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
          <div>{Config.businessFormationDefaults.missingFieldsOnSubmitModalText}</div>
          <ul>
            {dedupedFieldErrors.map((fieldError) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const label = (Config.businessFormationDefaults.requiredFieldsBulletPointLabel as any)[
                fieldError.field
              ];
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
          onStepClicked={(step: number) => {
            return onMoveToStep(step, { moveType: "STEPPER" });
          }}
        />
      </div>
      <div data-testid="formation-form" className="fg1 flex flex-column space-between">
        {BusinessFormationSteps[state.stepIndex].component}
        {displayButtons()}
      </div>
    </>
  );
};

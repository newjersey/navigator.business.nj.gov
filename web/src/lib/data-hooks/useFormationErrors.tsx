import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { getApiField } from "@/components/tasks/business-formation/getFieldForApiField";
import { getStepForField } from "@/components/tasks/business-formation/getStepForField";
import { requiredFieldsForUser } from "@/components/tasks/business-formation/requiredFieldsForUser";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationFieldErrorState, FormationStepNames } from "@/lib/types/types";
import { FormationFields } from "@businessnjgovnavigator/shared/formationData";
import { useContext, useMemo } from "react";

export const useFormationErrors = () => {
  const { state } = useContext(BusinessFormationContext);
  const { userData } = useUserData();

  const requiredFields = useMemo((): FormationFields[] => {
    return requiredFieldsForUser(state.formationFormData);
  }, [state.formationFormData]);

  const errorStates: Record<FormationFields, FormationFieldErrorState> = useMemo(() => {
    return requiredFields.reduce((acc, field) => {
      return {
        ...acc,
        [field]: getErrorStateForField(field, state.formationFormData, state.businessNameAvailability),
      };
    }, {} as Record<FormationFields, FormationFieldErrorState>);
  }, [requiredFields, state.formationFormData, state.businessNameAvailability]);

  const getApiFieldErrorState = (field: FormationFields): FormationFieldErrorState | undefined => {
    if (
      !userData?.formationData.formationResponse ||
      userData.formationData.formationResponse.errors.length === 0
    ) {
      return undefined;
    }

    const apiField = getApiField(field);
    const apiErrorForField = userData.formationData.formationResponse.errors.find((error) => {
      return error.field === apiField;
    });
    const hasApiFieldError = apiErrorForField !== undefined;
    const hasFieldBeenInteracted = state.interactedFields.includes(field);

    if (!hasApiFieldError || hasFieldBeenInteracted) {
      return undefined;
    }

    return {
      field,
      hasError: hasApiFieldError,
      label: apiErrorForField.message,
    };
  };

  const overrideErrorStateForApiErrors = (
    fieldErrorState: FormationFieldErrorState
  ): FormationFieldErrorState => {
    return getApiFieldErrorState(fieldErrorState.field) ?? fieldErrorState;
  };

  const getApiErrorMessage = (field: FormationFields): string | undefined => {
    return getApiFieldErrorState(field)?.label;
  };

  const allCurrentErrorsForStep = (
    step: FormationStepNames,
    overrides?: { hasSubmitted: boolean }
  ): FormationFieldErrorState[] => {
    const allErrorsForStep = requiredFields
      .filter((field) => {
        return getStepForField(field) === step;
      })
      .map((field) => {
        return errorStates[field];
      })
      .map((fieldErrorState) => {
        return overrideErrorStateForApiErrors(fieldErrorState);
      })
      .filter((fieldErrorState) => {
        return fieldErrorState.hasError;
      });

    if (overrides?.hasSubmitted ?? state.hasBeenSubmitted) {
      return allErrorsForStep;
    } else {
      return allErrorsForStep.filter((fieldErrorState) => {
        return state.interactedFields.includes(fieldErrorState.field);
      });
    }
  };

  const doesFieldHaveError = (field: FormationFields): boolean => {
    if (!requiredFields.includes(field)) {
      return false;
    }
    const fieldErrorState = overrideErrorStateForApiErrors(errorStates[field]);
    const fieldHasError = fieldErrorState.hasError;
    if (state.hasBeenSubmitted) {
      return fieldHasError;
    } else {
      return fieldHasError && state.interactedFields.includes(field);
    }
  };

  const getFieldErrorLabel = (field: FormationFields): string => {
    return overrideErrorStateForApiErrors(errorStates[field]).label;
  };

  const doSomeFieldsHaveError = (fields: FormationFields[]): boolean => {
    return fields
      .filter((field) => {
        return requiredFields.includes(field);
      })
      .some((field) => {
        return doesFieldHaveError(field);
      });
  };

  const requiredFieldsForStep = (step: FormationStepNames): FormationFields[] => {
    return requiredFields.filter((field) => {
      return getStepForField(field) === step;
    });
  };

  const isStepCompleted = (step: FormationStepNames): boolean => {
    if (step === "Review") {
      return false;
    }

    return requiredFieldsForStep(step).every((field) => {
      const errorState =
        errorStates[field] ||
        getErrorStateForField(field, state.formationFormData, state.businessNameAvailability);
      return !errorState.hasError;
    });
  };

  const doesStepHaveError = (step: FormationStepNames, overrides?: { hasSubmitted: boolean }): boolean => {
    if (step === "Name") {
      return allCurrentErrorsForStep(step, overrides).length > 0;
    }

    if (overrides?.hasSubmitted ?? state.hasBeenSubmitted) {
      return allCurrentErrorsForStep(step, overrides).length > 0;
    } else {
      return false;
    }
  };

  return {
    allCurrentErrorsForStep,
    doesFieldHaveError,
    doSomeFieldsHaveError,
    doesStepHaveError,
    isStepCompleted,
    getApiErrorMessage,
    getFieldErrorLabel,
  };
};

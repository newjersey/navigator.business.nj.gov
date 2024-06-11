import { getErrorStateForFormationField } from "@/components/tasks/business-formation/getErrorStateForFormationField";
import { getApiField } from "@/components/tasks/business-formation/getFieldForApiField";
import { getStepForField } from "@/components/tasks/business-formation/getStepForField";
import { validatedFieldsForUser } from "@/components/tasks/business-formation/validatedFieldsForUser";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationFieldErrorState, FormationStepNames } from "@/lib/types/types";
import { FieldsForErrorHandling, FormationFields } from "@businessnjgovnavigator/shared/formationData";
import { useContext, useMemo } from "react";

type FormationErrorsResponse = {
  allCurrentErrorsForStep: (
    step: FormationStepNames,
    overrides?: { hasSubmitted: boolean }
  ) => FormationFieldErrorState[];
  doesFieldHaveError: (field: FieldsForErrorHandling) => boolean;
  doSomeFieldsHaveError: (fields: FormationFields[]) => boolean;
  doesStepHaveError: (step: FormationStepNames, overrides?: { hasSubmitted: boolean }) => boolean;
  isStepCompleted: (step: FormationStepNames) => boolean;
  getApiErrorMessage: (field: FieldsForErrorHandling) => string | undefined;
  getFieldErrorLabel: (field: FormationFields) => string;
};

export const useFormationErrors = (): FormationErrorsResponse => {
  const { state } = useContext(BusinessFormationContext);
  const { business } = useUserData();

  const validatedFields = useMemo((): FieldsForErrorHandling[] => {
    return validatedFieldsForUser(state.formationFormData);
  }, [state.formationFormData]);

  const errorStates: Record<FieldsForErrorHandling, FormationFieldErrorState> = useMemo(() => {
    return validatedFields.reduce((acc, field) => {
      return {
        ...acc,
        [field]: getErrorStateForFormationField({
          field,
          formationFormData: state.formationFormData,
          businessNameAvailability: state.businessNameAvailability,
          foreignGoodStandingFile: state.foreignGoodStandingFile,
        }),
      };
    }, {} as Record<FieldsForErrorHandling, FormationFieldErrorState>);
  }, [
    validatedFields,
    state.formationFormData,
    state.businessNameAvailability,
    state.foreignGoodStandingFile,
  ]);

  const getApiFieldErrorState = (field: FieldsForErrorHandling): FormationFieldErrorState | undefined => {
    if (
      !business?.formationData.formationResponse ||
      business.formationData.formationResponse.errors.length === 0
    ) {
      return undefined;
    }

    const apiField = getApiField(field);
    const apiErrorForField = business.formationData.formationResponse.errors.find((error) => {
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

  const getApiErrorMessage = (field: FieldsForErrorHandling): string | undefined => {
    return getApiFieldErrorState(field)?.label;
  };

  const allCurrentErrorsForStep = (
    step: FormationStepNames,
    overrides?: { hasSubmitted: boolean }
  ): FormationFieldErrorState[] => {
    const allErrorsForStep = validatedFields
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

  const doesFieldHaveError = (field: FieldsForErrorHandling): boolean => {
    if (!validatedFields.includes(field)) {
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
        return validatedFields.includes(field);
      })
      .some((field) => {
        return doesFieldHaveError(field);
      });
  };

  const validatedFieldsForStep = (step: FormationStepNames): FieldsForErrorHandling[] => {
    return validatedFields.filter((field) => {
      return getStepForField(field) === step;
    });
  };

  const isStepCompleted = (step: FormationStepNames): boolean => {
    if (step === "Review") {
      return false;
    }

    return validatedFieldsForStep(step).every((field) => {
      const errorState =
        errorStates[field] ||
        getErrorStateForFormationField({
          field,
          formationFormData: state.formationFormData,
          businessNameAvailability: state.businessNameAvailability,
          foreignGoodStandingFile: state.foreignGoodStandingFile,
        });
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

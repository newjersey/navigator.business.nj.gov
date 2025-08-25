import { getErrorStateForEmergencyTripPermitField } from "@/components/tasks/abc-emergency-trip-permit/fields/getErrorStateForEmergencyTripPermitField";
import { getStepFromFieldName } from "@/components/tasks/abc-emergency-trip-permit/steps/EmergencyTripPermitStepsConfiguration";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { EmergencyTripPermitUserEnteredFieldNames } from "@businessnjgovnavigator/shared";
import { EmergencyTripPermitStepNames } from "@businessnjgovnavigator/shared/types";
import { useContext } from "react";

type EmergencyTripPermitErrorsResponse = {
  doesFieldHaveError: (field: EmergencyTripPermitUserEnteredFieldNames) => boolean;
  getFieldErrorLabel: (field: EmergencyTripPermitUserEnteredFieldNames) => string;
  doesStepHaveError: (step: EmergencyTripPermitStepNames) => boolean;
};

export const useEmergencyTripPermitErrors = (): EmergencyTripPermitErrorsResponse => {
  const { state } = useContext(EmergencyTripPermitContext);
  const { Config } = useConfig();

  const doesFieldHaveError = (field: EmergencyTripPermitUserEnteredFieldNames): boolean => {
    const emergencyTripPermitFieldErrorState = getErrorStateForEmergencyTripPermitField(
      field,
      state.applicationInfo,
    );
    return emergencyTripPermitFieldErrorState.hasError;
  };

  const getFieldErrorLabel = (field: EmergencyTripPermitUserEnteredFieldNames): string => {
    const emergencyTripPermitFieldErrorState = getErrorStateForEmergencyTripPermitField(
      field,
      state.applicationInfo,
    );
    const fieldLabelNames = Config.abcEmergencyTripPermit.fields;
    return templateEval(emergencyTripPermitFieldErrorState.label, {
      fieldName: fieldLabelNames[field],
    });
  };

  const doesStepHaveError = (stepName: EmergencyTripPermitStepNames): boolean => {
    for (const field of Object.keys(state.applicationInfo)) {
      const fieldName = field as EmergencyTripPermitUserEnteredFieldNames;
      if (doesFieldHaveError(fieldName) && getStepFromFieldName(fieldName) === stepName) {
        return true;
      }
    }
    return false;
  };

  return {
    doesFieldHaveError,
    getFieldErrorLabel,
    doesStepHaveError,
  };
};

import { getErrorStateForEmergencyTripPermitField } from "@/components/tasks/abc-emergency-trip-permit/fields/getErrorStateForEmergencyTripPermitField";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { EmergencyTripPermitFieldNames } from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { useContext } from "react";

type EmergencyTripPermitErrorsResponse = {
  doesFieldHaveError: (field: EmergencyTripPermitFieldNames) => boolean;
  getFieldErrorLabel: (field: EmergencyTripPermitFieldNames) => string;
};

export const useEmergencyTripPermitErrors = (): EmergencyTripPermitErrorsResponse => {
  const { state } = useContext(EmergencyTripPermitContext);
  const { Config } = useConfig();

  const doesFieldHaveError = (field: EmergencyTripPermitFieldNames): boolean => {
    const emergencyTripPermitFieldErrorState = getErrorStateForEmergencyTripPermitField(
      field,
      state.applicationInfo
    );
    return emergencyTripPermitFieldErrorState.hasError;
  };

  const getFieldErrorLabel = (field: EmergencyTripPermitFieldNames): string => {
    const emergencyTripPermitFieldErrorState = getErrorStateForEmergencyTripPermitField(
      field,
      state.applicationInfo
    );
    const fieldLabelNames = Config.abcEmergencyTripPermit.fields as Record<
      EmergencyTripPermitFieldNames,
      string
    >;
    return templateEval(emergencyTripPermitFieldErrorState.label, { fieldName: fieldLabelNames[field] });
  };

  return {
    doesFieldHaveError,
    getFieldErrorLabel,
  };
};

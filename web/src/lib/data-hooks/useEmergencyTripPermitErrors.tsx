import { getErrorStateForEmergencyTripPermitField } from "@/components/tasks/abc-emergency-trip-permit/getErrorStateForEmergencyTripPermitField";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { EmergencyTripPermitFieldNames } from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { useContext } from "react";

type AddressErrorsResponse = {
  doesFieldHaveError: (field: EmergencyTripPermitFieldNames) => boolean;
  getFieldErrorLabel: (field: EmergencyTripPermitFieldNames) => string;
};

export const useEmergencyTripPermitErrors = (): AddressErrorsResponse => {
  const { state } = useContext(EmergencyTripPermitContext);
  const { Config } = useConfig();

  const doesFieldHaveError = (field: EmergencyTripPermitFieldNames): boolean => {
    const addressFieldErrorState = getErrorStateForEmergencyTripPermitField(field, state.applicationInfo);
    return addressFieldErrorState.hasError;
  };

  const getFieldErrorLabel = (field: EmergencyTripPermitFieldNames): string => {
    const addressFieldErrorState = getErrorStateForEmergencyTripPermitField(field, state.applicationInfo);
    const fieldLabelNames = Config.abcEmergencyTripPermit.fields as Record<
      EmergencyTripPermitFieldNames,
      string
    >;
    return templateEval(addressFieldErrorState.label, { fieldName: fieldLabelNames[field] });
  };

  return {
    doesFieldHaveError,
    getFieldErrorLabel,
  };
};

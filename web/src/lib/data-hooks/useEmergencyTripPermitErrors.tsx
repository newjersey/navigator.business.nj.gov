import { getErrorStateForEmergencyTripPermitField } from "@/components/tasks/abc-emergency-trip-permit/getErrorStateForEmergencyTripPermitField";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { EmergencyTripPermitFieldNames } from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { useContext } from "react";

type AddressErrorsResponse = {
  doesFieldHaveError: (field: EmergencyTripPermitFieldNames) => boolean;
};

export const useEmergencyTripPermitErrors = (): AddressErrorsResponse => {
  const { state } = useContext(EmergencyTripPermitContext);

  const doesFieldHaveError = (field: EmergencyTripPermitFieldNames): boolean => {
    const addressFieldErrorState = getErrorStateForEmergencyTripPermitField(field, state.applicationInfo);
    return addressFieldErrorState.hasError;
  };

  return {
    doesFieldHaveError,
  };
};

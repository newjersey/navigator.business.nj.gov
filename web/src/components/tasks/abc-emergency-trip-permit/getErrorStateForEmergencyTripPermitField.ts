import { EmergencyTripPermitFieldErrorState } from "@/lib/types/types";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitFieldNames,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";

export const getErrorStateForEmergencyTripPermitField = (
  fieldName: EmergencyTripPermitFieldNames,
  state: EmergencyTripPermitApplicationInfo
): EmergencyTripPermitFieldErrorState => {
  if (state[fieldName] === "") {
    return {
      field: fieldName,
      hasError: true,
      label: "",
    };
  }
  return {
    field: fieldName,
    hasError: false,
    label: "",
  };
};

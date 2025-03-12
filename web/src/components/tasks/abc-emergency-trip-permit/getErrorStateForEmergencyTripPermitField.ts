import { EmergencyTripPermitErrorState } from "@/lib/types/types";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitFieldNames,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";

export const getErrorStateForEmergencyTripPermitField = (
  fieldName: EmergencyTripPermitFieldNames,
  state: EmergencyTripPermitApplicationInfo
): EmergencyTripPermitErrorState => {
  if (state[fieldName] == "") {
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

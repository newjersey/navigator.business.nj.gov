import { GenericTextFieldProps } from "@/components/GenericTextField";
import { EmergencyTripPermitTextFieldEntry } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitTextField";
import { useEmergencyTripPermitErrors } from "@/lib/data-hooks/useEmergencyTripPermitErrors";
import { EmergencyTripPermitFieldNames } from "@businessnjgovnavigator/shared/emergencyTripPermit";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName" | "error" | "inputWidth"> {
  fieldName: EmergencyTripPermitFieldNames;
  label?: string;
  secondaryLabel?: string;
  readOnly?: boolean;
  errorMap: Record<EmergencyTripPermitFieldNames, boolean>;
}

export const RequestorTextFieldEntry = (props: Props) => {
  const { doesFieldHaveError } = useEmergencyTripPermitErrors();
  return (
    <EmergencyTripPermitTextFieldEntry
      fieldName={props.fieldName}
      hasError={props.errorMap[props.fieldName]}
      label={props.label}
      handleChange={(value) => {
        if (value) {
          props.errorMap[props.fieldName] = doesFieldHaveError(props.fieldName);
        }
      }}
    />
  );
};

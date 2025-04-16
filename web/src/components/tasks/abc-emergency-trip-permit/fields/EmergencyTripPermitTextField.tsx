import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useEmergencyTripPermitErrors } from "@/lib/data-hooks/useEmergencyTripPermitErrors";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { ReactElement, useContext } from "react";
import { EmergencyTripPermitFieldNames } from "../../../../../../shared/src/emergencyTripPermit";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName" | "error" | "inputWidth"> {
  fieldName: EmergencyTripPermitFieldNames;
  secondaryLabel?: string;
  readOnly?: boolean;
  validationText?: string;
  maxLength?: number;
  numeric?: boolean;
}

export const EmergencyTripPermitTextFieldEntry = ({ className, ...props }: Props): ReactElement => {
  const context = useContext(EmergencyTripPermitContext);
  const { Config } = useConfig();
  const { isFormFieldInvalid } = useFormContextFieldHelpers(props.fieldName, DataFormErrorMapContext);
  const { getFieldErrorLabel } = useEmergencyTripPermitErrors();

  const setValueForField = (fieldName: EmergencyTripPermitFieldNames, value: string): void => {
    context.setApplicationInfo({
      ...context.state.applicationInfo,
      [fieldName]: value,
    });
  };
  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
    setValueForField(props.fieldName, value);
  };

  const fieldNameLabels = Config.abcEmergencyTripPermit.fields as Record<
    EmergencyTripPermitFieldNames,
    string
  >;

  return (
    <WithErrorBar
      className={className ?? "padding-bottom-1 padding-top-1"}
      hasError={isFormFieldInvalid}
      type={"ALWAYS"}
    >
      <strong>
        <ModifiedContent>{fieldNameLabels[props.fieldName]}</ModifiedContent>
      </strong>
      {props.secondaryLabel && <span className="margin-left-1">{props.secondaryLabel}</span>}
      <GenericTextField
        inputWidth={"full"}
        {...props}
        readOnly={props.readOnly}
        handleChange={handleChange}
        formContext={DataFormErrorMapContext}
        value={context.state.applicationInfo[props.fieldName]}
        error={isFormFieldInvalid}
        additionalValidationIsValid={(value) => {
          let isValid = true;
          if (props.required && value === "") {
            isValid = isValid && false;
          }
          if (props.maxLength && value.length > props.maxLength) {
            isValid = isValid && false;
          }
          return isValid;
        }}
        validationText={getFieldErrorLabel(props.fieldName)}
        numericProps={
          props.numeric
            ? {
                maxLength: props.maxLength ?? undefined,
                minLength: 1,
              }
            : undefined
        }
        preventRefreshWhenUnmounted
      />
    </WithErrorBar>
  );
};

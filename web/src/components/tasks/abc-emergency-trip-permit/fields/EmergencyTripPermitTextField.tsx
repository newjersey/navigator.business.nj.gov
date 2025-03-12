import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import {
  getErrorStateForEmergencyTripPermitField,
  getMaximumLengthForFieldName,
} from "@/components/tasks/abc-emergency-trip-permit/fields/getErrorStateForEmergencyTripPermitField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useEmergencyTripPermitErrors } from "@/lib/data-hooks/useEmergencyTripPermitErrors";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { EmergencyTripPermitUserEnteredFieldNames } from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { ReactElement, useContext } from "react";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName" | "error" | "inputWidth"> {
  fieldName: EmergencyTripPermitUserEnteredFieldNames;
  secondaryLabel?: string;
  readOnly?: boolean;
  validationText?: string;
  numeric?: boolean;
}

export const EmergencyTripPermitTextFieldEntry = ({ className, ...props }: Props): ReactElement => {
  const context = useContext(EmergencyTripPermitContext);
  const { Config } = useConfig();
  const { isFormFieldInvalid } = useFormContextFieldHelpers(props.fieldName, DataFormErrorMapContext);
  const { getFieldErrorLabel } = useEmergencyTripPermitErrors();

  const setValueForField = (fieldName: EmergencyTripPermitUserEnteredFieldNames, value: string): void => {
    context.setApplicationInfo({
      ...context.state.applicationInfo,
      [fieldName]: value,
    });
  };
  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
    setValueForField(props.fieldName, value);
  };

  const fieldNameLabels = Config.abcEmergencyTripPermit.fields;

  return (
    <span data-testid={`${props.fieldName}-field`}>
      <WithErrorBar
        className={className ?? "padding-bottom-1 padding-top-1"}
        hasError={isFormFieldInvalid}
        type={"ALWAYS"}
      >
        <span className={"text-bold"} id={`${props.fieldName}-input-label`}>
          <ModifiedContent>{fieldNameLabels[props.fieldName]}</ModifiedContent>
        </span>
        {props.secondaryLabel && <span className="margin-left-1">{props.secondaryLabel}</span>}
        <GenericTextField
          inputWidth={"full"}
          {...props}
          readOnly={props.readOnly}
          handleChange={handleChange}
          formContext={DataFormErrorMapContext}
          value={context.state.applicationInfo[props.fieldName]}
          error={isFormFieldInvalid}
          additionalValidationIsValid={() => {
            return !getErrorStateForEmergencyTripPermitField(props.fieldName, context.state.applicationInfo)
              .hasError;
          }}
          validationText={getFieldErrorLabel(props.fieldName)}
          numericProps={
            props.numeric
              ? {
                  maxLength: getMaximumLengthForFieldName(props.fieldName) ?? undefined,
                  minLength: 1,
                }
              : undefined
          }
          preventRefreshWhenUnmounted
          ariaLabel={fieldNameLabels[props.fieldName]}
        />
      </WithErrorBar>
    </span>
  );
};

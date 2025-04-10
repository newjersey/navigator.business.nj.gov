import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useEmergencyTripPermitErrors } from "@/lib/data-hooks/useEmergencyTripPermitErrors";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { ReactElement, useContext } from "react";
import { EmergencyTripPermitFieldNames } from "../../../../../shared/src/emergencyTripPermit";

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

  const prePopulateFieldsForBillingPage = (value: string): void => {
    switch (props.fieldName) {
      case "requestorFirstName":
        if (context.state.applicationInfo.payerFirstName === "") {
          setValueForField("payerFirstName", value);
        }
        break;
      case "requestorLastName":
        if (context.state.applicationInfo.payerLastName === "") {
          setValueForField("payerLastName", value);
        }
        break;
      case "requestorEmail":
        if (context.state.applicationInfo.payerEmail === "") {
          setValueForField("payerEmail", value);
        }
        break;
      case "requestorPhone":
        if (context.state.applicationInfo.payerPhoneNumber === "") {
          setValueForField("payerPhoneNumber", value);
        }
        break;
      case "requestorCountry":
        if (context.state.applicationInfo.payerCountry === "") {
          setValueForField("payerCountry", value);
        }
        break;
      case "requestorAddress1":
        if (context.state.applicationInfo.payerAddress1 === "") {
          setValueForField("payerAddress1", value);
        }
        break;
      case "requestorAddress2":
        if (context.state.applicationInfo.payerAddress2 === "") {
          setValueForField("payerAddress2", value);
        }
        break;
      case "requestorCity":
        if (context.state.applicationInfo.payerCity === "") {
          setValueForField("payerCity", value);
        }
        break;
      case "requestorStateProvince":
        if (context.state.applicationInfo.payerStateAbbreviation !== "NJ") {
          setValueForField("payerStateAbbreviation", value);
        }
        break;
      default:
        return;
    }
  };
  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
    console.log(props.fieldName);
    setValueForField(props.fieldName, value);
    console.log("BOB");
    console.log(props.fieldName);
    prePopulateFieldsForBillingPage(value);
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
              }
            : undefined
        }
      />
    </WithErrorBar>
  );
};

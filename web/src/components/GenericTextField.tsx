import { camelCaseToSentence } from "@/lib/utils/helpers";
import { TextField, TextFieldProps } from "@mui/material";
import React, { ChangeEvent, FocusEvent, ReactElement } from "react";

export interface GenericTextFieldProps {
  fieldName: string;
  fieldOptions?: TextFieldProps;
  onValidation?: (fieldName: string, invalid: boolean) => void;
  additionalValidation?: (value: string) => boolean;
  visualFilter?: (value: string) => string;
  valueFilter?: (value: string) => string;
  handleChange?: (value: string) => void;
  error?: boolean;
  validationText?: string;
  disabled?: boolean;
  placeholder?: string;
  value?: string | number;
  autoComplete?: string;
  required?: boolean;
  numericProps?: {
    maxLength: number;
    minLength?: number;
  };
  formInputWide?: boolean;
}

export const GenericTextField = (props: GenericTextFieldProps): ReactElement => {
  let visualFilter = props.visualFilter;
  let valueFilter = props.valueFilter;
  let additionalValidation = props.additionalValidation;
  let fieldOptions = props.fieldOptions;

  if (props.numericProps) {
    const regex = (value: string): string => value.replace(/[^0-9]/g, "");

    visualFilter = (value: string): string =>
      props.visualFilter ? props.visualFilter(regex(value)) : regex(value);

    const maxLength = props.numericProps?.maxLength as number;

    valueFilter = (value) => (maxLength ? regex(value).slice(0, maxLength) : regex(value));

    const validMinimumValue = (value: string): boolean => {
      if (!props.required && value.length == 0) {
        return true;
      }
      if (props.numericProps?.minLength) {
        return value.length >= props.numericProps.minLength;
      }
      if (props.numericProps?.maxLength) {
        return value.length >= props.numericProps.maxLength;
      }
      return true;
    };

    additionalValidation = (returnedValue: string): boolean =>
      ![
        validMinimumValue(returnedValue),
        returnedValue.length <= maxLength,
        props.additionalValidation ? props.additionalValidation(returnedValue) : true,
      ].some((i) => !i);
    fieldOptions = {
      ...fieldOptions,
      inputProps: { ...fieldOptions?.inputProps, inputMode: "numeric" },
    };
  }

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const value = valueFilter ? valueFilter(event.target.value) : event.target.value;
    const invalid = additionalValidation ? !additionalValidation(value) : false;
    const invalidRequired = props.required ? !value.trim() : false;
    props.onValidation &&
      props.onValidation(
        props.fieldName,
        [invalidRequired, invalid].some((i) => !!i)
      );
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = valueFilter ? valueFilter(event.target.value) : event.target.value;
    props.handleChange && props.handleChange(value);
    if (event && event.nativeEvent.constructor.name === "Event") {
      //Generic events triggered by autofill
      onValidation(event as FocusEvent<HTMLInputElement>);
    }
  };

  const value = visualFilter ? visualFilter(props.value?.toString() ?? "") : props.value?.toString() ?? "";

  return (
    <div className={`${props.formInputWide ? "form-input-wide" : "form-input"}`}>
      <TextField
        value={value ?? ""}
        id={props.fieldName}
        name={props.fieldName}
        onChange={handleChange}
        onBlur={onValidation}
        error={props.error}
        helperText={props.error ? props.validationText ?? " " : " "}
        variant="outlined"
        autoComplete={props.autoComplete ? props.autoComplete : "off"}
        placeholder={props.placeholder ?? ""}
        disabled={props.disabled}
        {...fieldOptions}
        sx={{ width: 1, ...fieldOptions?.sx }}
        inputProps={{
          ...fieldOptions?.inputProps,
          "aria-label": camelCaseToSentence(props.fieldName),
        }}
      />
    </div>
  );
};

import { camelCaseToSentence } from "@/lib/utils/helpers";
import { TextField, TextFieldProps } from "@mui/material";
import React, { ChangeEvent, FocusEvent, ReactElement } from "react";

export interface GenericTextFieldProps {
  readonly fieldName: string;
  readonly fieldOptions?: TextFieldProps;
  readonly onValidation?: (fieldName: string, invalid: boolean) => void;
  readonly additionalValidation?: (value: string) => boolean;
  readonly visualFilter?: (value: string) => string;
  readonly valueFilter?: (value: string) => string;
  readonly handleChange?: (value: string) => void;
  readonly error?: boolean;
  readonly noValidationMargin?: boolean;
  readonly validationText?: string;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly value?: string | number;
  readonly autoComplete?: string;
  readonly required?: boolean;
  readonly numericProps?: {
    readonly maxLength: number;
    readonly minLength?: number;
  };
  readonly formInputWide?: boolean;
  readonly ariaLabel?: string;
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

  const helperText = props.validationText
    ? props.error
      ? props.validationText
      : props.noValidationMargin
      ? ""
      : " "
    : "";
  return (
    <div className={`${props.formInputWide ? "form-input-wide" : "form-input"}`}>
      <TextField
        value={value ?? ""}
        id={props.fieldName}
        name={props.fieldName}
        onChange={handleChange}
        onBlur={onValidation}
        error={props.error}
        helperText={helperText}
        variant="outlined"
        autoComplete={props.autoComplete ? props.autoComplete : "off"}
        placeholder={props.placeholder ?? ""}
        disabled={props.disabled}
        {...fieldOptions}
        sx={{ width: 1, ...fieldOptions?.sx }}
        inputProps={{
          ...fieldOptions?.inputProps,
          "aria-label": props.ariaLabel ?? camelCaseToSentence(props.fieldName),
        }}
      />
    </div>
  );
};

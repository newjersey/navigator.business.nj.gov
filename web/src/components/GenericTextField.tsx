import { camelCaseToSentence } from "@/lib/utils/helpers";
import { TextField, TextFieldProps } from "@mui/material";
import React, { ChangeEvent, FocusEvent, ReactElement, useEffect } from "react";

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
  onChangeTrigger?: boolean;
  resetOnChangeTrigger?: () => void;
  autoComplete?: string;
  required?: boolean;
  numericProps?: {
    maxLength: number;
    minLength?: number;
  };
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

    const minValue = (value: string): boolean =>
      !props.required && value.length == 0
        ? true
        : props.numericProps?.minLength
        ? value.length >= props.numericProps.minLength
        : true;

    additionalValidation = (returnedValue: string): boolean =>
      ![
        minValue(returnedValue),
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

  useEffect(() => {
    props.onChangeTrigger &&
      props.resetOnChangeTrigger &&
      props.resetOnChangeTrigger() &&
      props.handleChange &&
      props.handleChange(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.onChangeTrigger]);

  return (
    <TextField
      value={value ?? ""}
      id={props.fieldName}
      name={props.fieldName}
      onChange={handleChange}
      onBlur={onValidation}
      error={props.error}
      helperText={props.error ? props.validationText ?? " " : " "}
      variant="outlined"
      autoComplete={props.autoComplete}
      fullWidth
      placeholder={props.placeholder ?? ""}
      disabled={props.disabled}
      {...fieldOptions}
      inputProps={{
        ...fieldOptions?.inputProps,
        "aria-label": camelCaseToSentence(props.fieldName),
      }}
    />
  );
};

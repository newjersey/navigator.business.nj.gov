import { camelCaseToSentence } from "@/lib/utils/helpers";
import { TextField, TextFieldProps } from "@mui/material";
import React, { ChangeEvent, FocusEvent, ReactElement } from "react";

interface Props {
  fieldName: string;
  fieldOptions?: TextFieldProps;
  onValidation?: (invalid: boolean, fieldName: string) => void;
  additionalValidation?: (value: string) => boolean;
  visualFilter?: (value: string) => string;
  valueFilter?: (value: string) => string;
  handleChange?: (value: string) => void;
  error?: boolean;
  validationText?: string;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  autoComplete?: string;
  required?: boolean;
}

export const GenericTextField = (props: Props): ReactElement => {
  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const value = props.valueFilter ? props.valueFilter(event.target.value) : event.target.value;
    const invalid = props.additionalValidation ? !props.additionalValidation(value) : false;
    const required = props.required ? !value.trim() : false;
    props.onValidation &&
      props.onValidation(
        [required, invalid].some((i) => !!i),
        props.fieldName
      );
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = props.valueFilter ? props.valueFilter(event.target.value) : event.target.value;
    props.handleChange && props.handleChange(value);
    if (event && event.nativeEvent.constructor.name === "Event") {
      //Generic events triggered by autofill
      onValidation(event as FocusEvent<HTMLInputElement>);
    }
  };

  const value = props.visualFilter ? props.visualFilter(props.value ?? "") : props.value;

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
      {...props.fieldOptions}
      inputProps={{
        ...props.fieldOptions?.inputProps,
        "aria-label": camelCaseToSentence(props.fieldName),
      }}
    />
  );
};

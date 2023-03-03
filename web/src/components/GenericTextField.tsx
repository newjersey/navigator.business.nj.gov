import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { OutlinedInputProps, TextField, TextFieldProps } from "@mui/material";

import { ChangeEvent, FocusEvent, forwardRef, HTMLInputTypeAttribute, ReactElement, RefObject } from "react";

export interface GenericTextFieldProps {
  fieldName: string;
  fieldOptions?: TextFieldProps;
  onValidation?: (fieldName: string, invalid: boolean, value?: string) => void;
  additionalValidation?: (value: string) => boolean;
  visualFilter?: (value: string) => string;
  valueFilter?: (value: string) => string;
  handleChange?: (value: string) => void;
  onChange?: (value: string) => void;
  error?: boolean;
  noValidationMargin?: boolean;
  validationText?: string;
  disabled?: boolean;
  value?: string | number;
  autoComplete?: string;
  required?: boolean;
  numericProps?: {
    trimLeadingZeroes?: boolean;
    maxLength?: number;
    minLength?: number;
  };
  formInputWide?: boolean;
  ariaLabel?: string;
  formInputFull?: boolean;
  className?: string;
  allowMasking?: boolean;
  inputProps?: OutlinedInputProps;
  type?: HTMLInputTypeAttribute;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
export const GenericTextField = forwardRef(
  (
    props: GenericTextFieldProps,
    ref?: ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null | undefined
  ): ReactElement => {
    let visualFilter = props.visualFilter;
    let valueFilter = props.valueFilter;
    let additionalValidation = props.additionalValidation;
    let fieldOptions = props.fieldOptions;
    if (props.numericProps) {
      const regex = (value: string): string => {
        if (props.allowMasking) {
          return value.replace(props.numericProps?.trimLeadingZeroes ? /^0+|\D/g : /[^\d*]/g, "");
        }
        return value.replace(props.numericProps?.trimLeadingZeroes ? /^0+|\D/g : /\D/g, "");
      };

      visualFilter = (value: string): string => {
        return props.visualFilter ? props.visualFilter(regex(value)) : regex(value);
      };

      const maxLength = props.numericProps?.maxLength;

      valueFilter = (value) => {
        return maxLength ? regex(value).slice(0, maxLength) : regex(value);
      };

      const validMinimumValue = (value: string): boolean => {
        if (!props.required && value.length === 0) {
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

      additionalValidation = (returnedValue: string): boolean => {
        return ![
          validMinimumValue(returnedValue),
          returnedValue.length <= (maxLength ?? Number.POSITIVE_INFINITY),
          props.additionalValidation ? props.additionalValidation(returnedValue) : true,
        ].some((i) => {
          return !i;
        });
      };
      fieldOptions = {
        ...fieldOptions,
        inputProps: { ...fieldOptions?.inputProps, inputMode: "numeric" },
      };
    }

    const validation = (currentValue: string): void => {
      const value = valueFilter ? valueFilter(currentValue) : currentValue;
      const invalidAdditional = additionalValidation ? !additionalValidation(value) : false;
      const invalidRequired = props.required ? !value.trim() : false;
      const isFieldInvalid = invalidAdditional || invalidRequired;
      props.onValidation && props.onValidation(props.fieldName, isFieldInvalid, currentValue);
    };

    const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
      validation(event.target.value);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const value = valueFilter ? valueFilter(event.target.value) : event.target.value;
      props.handleChange && props.handleChange(value);
      props.onChange && props.onChange(value);
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
      <div
        className={`${props.formInputWide ? "form-input-wide" : ""} ${
          !props.formInputFull && !props.formInputWide ? "form-input" : ""
        } margin-top-2 ${props.className ?? ""} ${props.error ? "error" : ""}`}
      >
        <TextField
          value={value ?? ""}
          id={props.fieldName}
          ref={ref}
          name={props.fieldName}
          onChange={handleChange}
          onBlur={onValidation}
          error={props.error}
          helperText={helperText}
          variant="outlined"
          autoComplete={props.autoComplete ?? "no"}
          disabled={props.disabled}
          {...fieldOptions}
          sx={{ width: 1, ...fieldOptions?.sx }}
          inputProps={{
            ...fieldOptions?.inputProps,
            "aria-label": props.ariaLabel ?? camelCaseToSentence(props.fieldName),
          }}
          InputProps={props.inputProps}
          type={props.type}
        />
      </div>
    );
  }
);

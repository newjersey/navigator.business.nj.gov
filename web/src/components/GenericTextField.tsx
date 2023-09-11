import { FormContextType } from "@/contexts/formContext";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { FieldErrorType, FormContextFieldProps } from "@/lib/types/types";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { OutlinedInputProps, TextField, TextFieldProps } from "@mui/material";

import {
  ChangeEvent,
  Context,
  FocusEvent,
  forwardRef,
  HTMLInputTypeAttribute,
  ReactElement,
  RefObject,
  useMemo,
} from "react";

export interface GenericTextFieldProps<T = FieldErrorType> extends FormContextFieldProps<T> {
  fieldName: string;
  inputWidth: "full" | "default" | "reduced";
  fieldOptions?: TextFieldProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formContext?: Context<FormContextType<any>>;
  onValidation?: (fieldName: string, invalid: boolean, value?: string) => void;
  additionalValidationIsValid?: (value: string) => boolean;
  visualFilter?: (value: string) => string;
  valueFilter?: (value: string) => string;
  handleChange?: (value: string) => void | ((value: ChangeEvent<HTMLInputElement>) => void);
  onChange?: (value: string) => void | ((value: ChangeEvent<HTMLInputElement>) => void);
  onFocus?: () => void;
  error?: boolean;
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
  ariaLabel?: string;
  className?: string;
  allowMasking?: boolean;
  inputProps?: OutlinedInputProps;
  type?: HTMLInputTypeAttribute;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
export const GenericTextField = forwardRef(
  <T,>(
    props: GenericTextFieldProps<T>,
    ref?: ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null | undefined
  ): ReactElement => {
    const widthStyling =
      props.inputWidth === "reduced"
        ? "text-field-width-reduced"
        : props.inputWidth === "full"
        ? "width-100"
        : "text-field-width-default";

    let visualFilter = props.visualFilter;
    let valueFilter = props.valueFilter;
    let additionalValidationIsValid = props.additionalValidationIsValid;
    let fieldOptions = props.fieldOptions;

    const value = useMemo(
      () => (visualFilter ? visualFilter(props.value?.toString() ?? "") : props.value?.toString() ?? ""),
      [props.value, visualFilter]
    );

    const { RegisterForOnSubmit, Validate, isFormFieldInValid } = useFormContextFieldHelpers(
      props.fieldName,
      props.formContext,
      props.errorTypes
    );

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

      valueFilter = (value: string): string => {
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

      additionalValidationIsValid = (returnedValue: string): boolean => {
        return ![
          validMinimumValue(returnedValue),
          returnedValue.length <= (maxLength ?? Number.POSITIVE_INFINITY),
          props.additionalValidationIsValid ? props.additionalValidationIsValid(returnedValue) : true,
        ].some((i) => {
          return !i;
        });
      };
      fieldOptions = {
        ...fieldOptions,
        inputProps: { ...fieldOptions?.inputProps, inputMode: "numeric" },
      };
    }

    const isFieldInvalid = (currentValue: string): boolean => {
      const value = valueFilter ? valueFilter(currentValue) : currentValue;
      const invalidAdditional = additionalValidationIsValid ? !additionalValidationIsValid(value) : false;
      const invalidRequired = props.required ? !value.trim() : false;
      return invalidAdditional || invalidRequired;
    };

    RegisterForOnSubmit(() => !isFieldInvalid(value));

    const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
      const invalid = isFieldInvalid(event.target.value);
      Validate(invalid);
      props.onValidation && props.onValidation(props.fieldName, invalid, event.target.value);
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

    const error = props.error ?? isFormFieldInValid;
    return (
      <div className={`${widthStyling} ${props.className ?? ""} ${error ? "error" : ""}`}>
        <TextField
          value={value ?? ""}
          id={props.fieldName}
          ref={ref}
          name={props.fieldName}
          onChange={handleChange}
          onBlur={onValidation}
          error={error}
          helperText={error && props.validationText}
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
          onFocus={props.onFocus}
        />
      </div>
    );
  }
);

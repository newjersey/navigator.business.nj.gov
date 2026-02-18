import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { OutlinedInputProps, TextField, TextFieldProps } from "@mui/material";

import {
  FieldErrorType,
  FormContextFieldProps,
  FormContextType,
} from "@businessnjgovnavigator/shared/types";
import {
  ChangeEvent,
  Context,
  FocusEvent,
  ForwardedRef,
  forwardRef,
  HTMLInputTypeAttribute,
  ReactElement,
  useMemo,
  useState,
} from "react";

export interface GenericTextFieldProps<T = FieldErrorType> extends FormContextFieldProps<T> {
  fieldName: string;
  inputWidth?: "full" | "default" | "reduced";
  fieldOptions?: TextFieldProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formContext?: Context<FormContextType<any>>;
  onValidation?: (fieldName: string, invalid: boolean, value?: string) => void;
  additionalValidationIsValid?: (value: string) => boolean;
  visualFilter?: (value: string) => string;
  valueFilter?: (value: string) => string;
  handleChange?: (value: string) => void | ((value: ChangeEvent<HTMLInputElement>) => void);
  onChange?: (value: string) => void | ((value: ChangeEvent<HTMLInputElement>) => void);
  onImmediateChange?: (value: string) => void; // Called on every keystroke, even with updateOnBlur
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
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
  readOnly?: boolean;
  preventRefreshWhenUnmounted?: boolean;
  updateOnBlur?: boolean; // When true, only call handleChange on blur instead of every keystroke
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
export const GenericTextField = forwardRef(
  <T,>(props: GenericTextFieldProps<T>, ref?: ForwardedRef<HTMLDivElement>): ReactElement => {
    const {
      numericProps,
      visualFilter: propsVisualFilter,
      value: propsValue,
      updateOnBlur,
    } = props;

    // Local state for blur-based updates - only used when updateOnBlur is true
    const [localValue, setLocalValue] = useState<string>("");
    const [isLocalValueActive, setIsLocalValueActive] = useState<boolean>(false);

    const widthStyling =
      props.inputWidth === "reduced"
        ? "text-field-width-reduced"
        : props.inputWidth === "full"
          ? "width-100"
          : "text-field-width-default";

    const { Config } = useConfig();

    // Compute filters and validators based on numericProps
    const regex = useMemo(
      () =>
        numericProps
          ? (value: string): string => {
              if (props.allowMasking) {
                return value.replace(numericProps?.trimLeadingZeroes ? /^0+|\D/g : /[^\d*]/g, "");
              }
              return value.replace(numericProps?.trimLeadingZeroes ? /^0+|\D/g : /\D/g, "");
            }
          : undefined,
      [numericProps, props.allowMasking],
    );

    const maxLength = numericProps?.maxLength;

    const valueFilter =
      numericProps && regex
        ? (value: string): string => {
            return maxLength ? regex(value).slice(0, maxLength) : regex(value);
          }
        : props.valueFilter;

    const validMinimumValue = numericProps
      ? (value: string): boolean => {
          if (!props.required && value.length === 0) {
            return true;
          }
          if (numericProps?.minLength) {
            return value.length >= numericProps.minLength;
          }
          if (numericProps?.maxLength) {
            return value.length >= numericProps.maxLength;
          }
          return true;
        }
      : undefined;

    const additionalValidationIsValid =
      numericProps && validMinimumValue
        ? (returnedValue: string): boolean => {
            return ![
              validMinimumValue(returnedValue),
              returnedValue.length <= (maxLength ?? Number.POSITIVE_INFINITY),
              props.additionalValidationIsValid
                ? props.additionalValidationIsValid(returnedValue)
                : true,
            ].some((i) => {
              return !i;
            });
          }
        : props.additionalValidationIsValid;

    const fieldOptions = numericProps
      ? {
          ...props.fieldOptions,
          inputProps: { ...props.fieldOptions?.inputProps, inputMode: "numeric" as const },
        }
      : props.fieldOptions;

    const value = useMemo(() => {
      const visualFilter =
        numericProps && regex
          ? (value: string): string => {
              return propsVisualFilter ? propsVisualFilter(regex(value)) : regex(value);
            }
          : propsVisualFilter;

      // When updateOnBlur is true and user is typing, use local state instead of props value
      const sourceValue =
        updateOnBlur && isLocalValueActive ? localValue : (propsValue?.toString() ?? "");

      return visualFilter ? visualFilter(sourceValue) : sourceValue;
    }, [
      propsValue,
      numericProps,
      regex,
      propsVisualFilter,
      updateOnBlur,
      isLocalValueActive,
      localValue,
    ]);

    const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers(
      props.fieldName,
      props.formContext,
      props.errorTypes,
    );

    const isFieldValid = (currentValue: string): boolean => {
      const value = valueFilter ? valueFilter(currentValue) : currentValue;
      const isValidAdditional = additionalValidationIsValid
        ? additionalValidationIsValid(value)
        : true;
      const isValidRequired = props.required ? !!value.trim() : true;
      return isValidAdditional && isValidRequired;
    };

    RegisterForOnSubmit(() => isFieldValid(value), props.preventRefreshWhenUnmounted);

    const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
      const isValid = isFieldValid(event.target.value);
      setIsValid(isValid);
      props.onValidation && props.onValidation(props.fieldName, !isValid, event.target.value);

      // When using blur-based updates, sync local state to parent state on blur
      if (updateOnBlur && isLocalValueActive) {
        const value = valueFilter ? valueFilter(event.target.value) : event.target.value;
        props.handleChange && props.handleChange(value);
        props.onChange && props.onChange(value);
        setIsLocalValueActive(false);
      }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const value = valueFilter ? valueFilter(event.target.value) : event.target.value;

      // Always call onImmediateChange on every keystroke (for component switching logic)
      props.onImmediateChange && props.onImmediateChange(value);

      if (updateOnBlur) {
        // Store in local state, don't update parent until blur
        setLocalValue(value);
        setIsLocalValueActive(true);
      } else {
        // Default behavior: update parent immediately
        props.handleChange && props.handleChange(value);
        props.onChange && props.onChange(value);
      }
    };

    // Handle blur - call both validation and custom onBlur if provided
    const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
      onValidation(event);
      props.onBlur?.();
    };

    // Handle focus - call custom onFocus if provided
    const handleFocus = (): void => {
      props.onFocus?.();
    };

    const error = props.error ?? isFormFieldInvalid;
    return (
      <div className={`${widthStyling} ${props.className ?? ""} ${error ? "error" : ""}`}>
        <TextField
          value={value ?? ""}
          id={props.fieldName}
          ref={ref}
          name={props.fieldName}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          error={error}
          helperText={error && props.validationText}
          variant="outlined"
          autoComplete={props.autoComplete ?? "no"}
          disabled={props.disabled}
          {...fieldOptions}
          sx={{ width: 1, ...fieldOptions?.sx }}
          inputProps={{
            readOnly: props.readOnly,
            "aria-readonly": props.readOnly,
            className: `${props.readOnly ? "bg-base-lightest" : ""}`,
            ...fieldOptions?.inputProps,
            "aria-label": props.ariaLabel ?? camelCaseToSentence(props.fieldName),
            tabIndex: 0,
          }}
          InputProps={{
            readOnly: props.readOnly,
            "aria-readonly": props.readOnly,
            className: `${props.readOnly ? "bg-base-lightest" : ""}`,
            ...props.inputProps,
          }}
          required={props.required}
          type={props.type}
          onKeyDown={props.onKeyDown}
        />

        <div aria-live="polite" className="screen-reader-only">
          {error && (
            <div>{`${
              Config.siteWideErrorMessages.errorScreenReaderInlinePrefix
            } ${camelCaseToSentence(props.fieldName)}, ${props.validationText}`}</div>
          )}
        </div>
      </div>
    );
  },
);

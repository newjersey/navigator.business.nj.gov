import React, { ReactElement } from "react";
import { GenericTextField } from "./GenericTextField";

interface Props {
  fieldName: string;
  validationText?: string;
  maxLength: number;
  minLength?: number;
  value: string | number;
  visualFilter?: (value: string) => string;
  handleChange?: (value: string) => void;
  additionalValidation?: (value: string) => boolean;
  onValidation?: (invalid: boolean, fieldName: string) => void;
  error?: boolean;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
}

export const GenericNumericField = ({ value, minLength, maxLength, ...props }: Props): ReactElement => {
  const regex = (value: string): string => value.replace(/[^0-9]/g, "");

  const additionalValidation = (returndValue: string): boolean =>
    ![
      minLength ? returndValue.length >= minLength : true,
      returndValue.length <= maxLength,
      props.additionalValidation ? props.additionalValidation(returndValue) : true,
    ].some((i) => !i);

  return (
    <GenericTextField
      {...props}
      valueFilter={(value) => (maxLength ? regex(value).slice(0, maxLength) : regex(value))}
      value={value.toString()}
      additionalValidation={additionalValidation}
      visualFilter={props.visualFilter ? props.visualFilter : regex}
      fieldOptions={{
        inputProps: { inputMode: "numeric" },
      }}
    />
  );
};

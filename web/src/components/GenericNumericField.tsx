import React, { ReactElement } from "react";
import { GenericTextField, GenericTextFieldProps } from "./GenericTextField";
export interface NumericFieldProps {
  maxLength: number;
  minLength?: number;
}

interface Props extends Omit<GenericTextFieldProps, "numericProps">, NumericFieldProps {}

export const GenericNumericField = ({ minLength, maxLength, ...props }: Props): ReactElement => {
  return <GenericTextField {...props} numericProps={{ minLength, maxLength }} />;
};

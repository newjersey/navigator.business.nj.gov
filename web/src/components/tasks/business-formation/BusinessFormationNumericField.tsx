import { NumericFieldProps } from "@/components/GenericNumericField";
import React, { ReactElement } from "react";
import {
  BusinessFormationTextField,
  Props as BusinessFormationTextFieldProps,
} from "./BusinessFormationTextField";

interface Props extends Omit<BusinessFormationTextFieldProps, "numericProps">, NumericFieldProps {}

export const BusinessFormationNumericField = ({ minLength, maxLength, ...props }: Props): ReactElement => {
  return (
    <>
      <BusinessFormationTextField {...props} numericProps={{ minLength, maxLength }} />
    </>
  );
};

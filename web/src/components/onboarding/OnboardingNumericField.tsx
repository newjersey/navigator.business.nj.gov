import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { templateEval } from "@/lib/utils/helpers";
import React, { ReactElement } from "react";

interface NumericFieldProps {
  maxLength: number;
  minLength?: number;
}

interface Props extends Omit<OnboardingProps, "numericProps">, NumericFieldProps {}

export const OnboardingNumericField = ({ minLength, maxLength, ...props }: Props): ReactElement => {
  return (
    <OnboardingField
      validationText={templateEval(OnboardingDefaults.errorTextMinimumNumericField, {
        length: maxLength.toString(),
      })}
      {...props}
      numericProps={{ minLength, maxLength }}
    />
  );
};

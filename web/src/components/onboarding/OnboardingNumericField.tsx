import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { templateEval } from "@/lib/utils/helpers";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";

interface NumericFieldProps {
  maxLength: number;
  minLength?: number;
}

interface Props extends Omit<OnboardingProps, "numericProps">, NumericFieldProps {}

export const OnboardingNumericField = ({ minLength, maxLength, ...props }: Props): ReactElement => {
  return (
    <OnboardingField
      validationText={templateEval(Defaults.onboardingDefaults.errorTextMinimumNumericField, {
        length: maxLength.toString(),
      })}
      {...props}
      numericProps={{ minLength, maxLength }}
    />
  );
};

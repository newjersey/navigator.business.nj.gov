import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

interface NumericFieldProps {
  maxLength: number;
  minLength?: number;
}

interface Props extends Omit<OnboardingProps, "numericProps">, NumericFieldProps {}

export const OnboardingNumericField = ({ minLength, maxLength, ...props }: Props): ReactElement => {
  return (
    <OnboardingField
      validationText={templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, {
        length: maxLength.toString(),
      })}
      {...props}
      numericProps={{ minLength, maxLength }}
    />
  );
};

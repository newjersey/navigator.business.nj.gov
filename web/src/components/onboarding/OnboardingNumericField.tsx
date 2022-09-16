import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement } from "react";

interface NumericFieldProps {
  maxLength: number;
  minLength?: number;
}

interface Props extends Omit<OnboardingProps, "numericProps">, NumericFieldProps {}

export const OnboardingNumericField = ({ minLength, maxLength, ...props }: Props): ReactElement => {
  const validationText =
    minLength === undefined
      ? templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, {
          length: maxLength.toString(),
        })
      : templateEval(Config.onboardingDefaults.errorTextMinimumRangeNumericField, {
          min: minLength.toString(),
          max: maxLength.toString(),
        });
  return (
    <OnboardingField
      numericProps={{ minLength, maxLength }}
      {...props}
      validationText={props.validationText ?? validationText}
    />
  );
};

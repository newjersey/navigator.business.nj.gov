import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface NumericFieldProps {
  maxLength: number;
  minLength?: number;
}

interface Props<T> extends Omit<OnboardingProps<T>, "numericProps">, NumericFieldProps {}

export const ProfileNumericField = <T,>({ minLength, maxLength, ...props }: Props<T>): ReactElement => {
  const { Config } = useConfig();

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

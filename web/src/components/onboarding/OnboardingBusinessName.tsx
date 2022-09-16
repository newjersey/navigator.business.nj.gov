import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { ProfileFieldErrorMap } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props extends Omit<OnboardingProps, "fieldName"> {
  fieldStates?: Partial<ProfileFieldErrorMap>;
}

export const OnboardingBusinessName = (props: Props): ReactElement => {
  return (
    <OnboardingField
      fieldName="businessName"
      error={props.fieldStates ? props.fieldStates?.businessName?.invalid : false}
      required={true}
      fieldOptions={{
        inputProps: { "data-testid": "businessName" },
      }}
      {...props}
    />
  );
};

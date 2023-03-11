import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { ReactElement } from "react";

export const OnboardingBusinessName = (props: Omit<OnboardingProps, "fieldName">): ReactElement => {
  return (
    <OnboardingField
      fieldName="businessName"
      fieldOptions={{
        inputProps: { "data-testid": "businessName" },
      }}
      {...props}
    />
  );
};

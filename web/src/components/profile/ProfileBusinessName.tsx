import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { ReactElement } from "react";

export const ProfileBusinessName = (
  props: Omit<OnboardingProps, "fieldName" | "inputWidth">
): ReactElement => {
  return (
    <OnboardingField
      fieldName="businessName"
      fieldOptions={{
        inputProps: { "data-testid": "businessName" },
      }}
      inputWidth="default"
      {...props}
    />
  );
};

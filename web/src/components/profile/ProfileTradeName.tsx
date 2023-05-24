import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { ReactElement } from "react";

export const ProfileTradeName = (props: Omit<OnboardingProps, "fieldName">): ReactElement => {
  return (
    <OnboardingField
      fieldName="tradeName"
      fieldOptions={{
        inputProps: { "data-testid": "tradeName" },
      }}
      {...props}
    />
  );
};

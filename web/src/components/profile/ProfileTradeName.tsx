import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { ReactElement } from "react";

export const ProfileTradeName = (props: Omit<OnboardingProps, "fieldName" | "inputWidth">): ReactElement => {
  return (
    <OnboardingField
      fieldName="tradeName"
      inputWidth="default"
      fieldOptions={{
        inputProps: { "data-testid": "tradeName" }
      }}
      {...props}
    />
  );
};

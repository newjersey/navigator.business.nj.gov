import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { ReactElement } from "react";

export const ProfileResponsibleOwnerName = (
  props: Omit<OnboardingProps, "fieldName" | "inputWidth">
): ReactElement => {
  return (
    <OnboardingField
      fieldName="responsibleOwnerName"
      fieldOptions={{
        inputProps: { "data-testid": "responsibleOwnerName" },
      }}
      inputWidth="default"
      {...props}
    />
  );
};

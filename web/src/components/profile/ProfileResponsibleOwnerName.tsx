import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { ReactElement } from "react";

export const ProfileResponsibleOwnerName = (props: Omit<OnboardingProps, "fieldName">): ReactElement => {
  return (
    <OnboardingField
      fieldName="responsibleOwnerName"
      fieldOptions={{
        inputProps: { "data-testid": "responsibleOwnerName" },
      }}
      {...props}
    />
  );
};

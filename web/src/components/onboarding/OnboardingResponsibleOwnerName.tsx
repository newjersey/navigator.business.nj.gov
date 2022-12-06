import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { ProfileFieldErrorMap } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props extends Omit<OnboardingProps, "fieldName"> {
  fieldStates?: Partial<ProfileFieldErrorMap>;
}

export const OnboardingResponsibleOwnerName = (props: Props): ReactElement => {
  return (
    <OnboardingField
      fieldName="responsibleOwnerName"
      error={props.fieldStates ? props.fieldStates?.responsibleOwnerName?.invalid : false}
      required={true}
      fieldOptions={{
        inputProps: { "data-testid": "responsibleOwnerName" },
      }}
      {...props}
    />
  );
};

import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import React, { ReactElement } from "react";
import { OnboardingField } from "./OnboardingField";

interface Props {
  onValidation?: (field: ProfileFields, invalid: boolean) => void;
  fieldStates?: ProfileFieldErrorMap;
}

export const OnboardingBusinessName = (props: Props): ReactElement => {
  return (
    <OnboardingField
      fieldName={"businessName"}
      onValidation={props.onValidation}
      error={props.fieldStates ? props.fieldStates.businessName.invalid : false}
      required={true}
      validationText={OnboardingDefaults.errorTextRequiredBusinessName}
    />
  );
};

import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import React, { FocusEvent, ReactElement } from "react";
import { OnboardingField } from "./OnboardingField";

interface Props {
  onValidation?: (field: ProfileFields, invalid: boolean) => void;
  fieldStates?: ProfileFieldErrorMap;
}

export const OnboardingBusinessName = (props: Props): ReactElement => {
  const isInvalid = props.fieldStates ? props.fieldStates.businessName.invalid : false;

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    if (!props.onValidation) return;
    const valid = event.target.value.length > 0;
    props.onValidation("businessName", !valid);
  };

  return (
    <OnboardingField
      fieldName={"businessName"}
      error={isInvalid}
      onValidation={onValidation}
      validationText={OnboardingDefaults.errorTextRequiredBusinessName}
    />
  );
};

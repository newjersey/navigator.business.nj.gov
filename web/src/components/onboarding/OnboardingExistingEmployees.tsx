import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import React, { ReactElement, ReactNode } from "react";
import { OnboardingNumericField } from "./OnboardingNumericField";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  children?: ReactNode;
}

export const OnboardingExistingEmployees = (props: Props): ReactElement => {
  const fieldName = "existingEmployees";

  return (
    <>
      <OnboardingNumericField
        onValidation={props.onValidation}
        error={props.fieldStates[fieldName].invalid}
        fieldName={fieldName}
        maxLength={7}
        validationText={OnboardingDefaults.errorTextRequiredExistingEmployees}
        required={true}
      />
      {props.children}
    </>
  );
};

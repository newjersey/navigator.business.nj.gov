import React, { ReactElement, ReactNode } from "react";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { NumericField } from "./NumericField";
import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  children?: ReactNode;
}

export const OnboardingExistingEmployees = (props: Props): ReactElement => {
  const fieldName = "existingEmployees";

  return (
    <>
      <NumericField
        onValidation={props.onValidation}
        invalid={props.fieldStates[fieldName].invalid}
        fieldName={fieldName}
        maxLength={7}
        minLength={1}
        validationText={OnboardingDefaults.errorTextRequiredExistingEmployees}
      />
      {props.children}
    </>
  );
};

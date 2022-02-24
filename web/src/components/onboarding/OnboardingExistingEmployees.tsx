import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement, ReactNode } from "react";
import { OnboardingNumericField } from "./OnboardingNumericField";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  children?: ReactNode;
  headerAriaLevel?: number;
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
        minLength={1}
        validationText={Defaults.onboardingDefaults.errorTextRequiredExistingEmployees}
        required={true}
        headerAriaLevel={props.headerAriaLevel}
      />
      {props.children}
    </>
  );
};

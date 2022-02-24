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

export const OnboardingTaxPin = (props: Props): ReactElement => {
  const fieldName = "taxPin";

  return (
    <>
      <OnboardingNumericField
        onValidation={props.onValidation}
        error={props.fieldStates[fieldName].invalid}
        fieldName={fieldName}
        maxLength={4}
        minLength={4}
        validationText={Defaults.profileDefaults.taxPinErrorText}
        headerAriaLevel={props.headerAriaLevel}
      />
      {props.children}
    </>
  );
};

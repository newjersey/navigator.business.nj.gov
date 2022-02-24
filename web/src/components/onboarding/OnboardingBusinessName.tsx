import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";
import { OnboardingField } from "./OnboardingField";

interface Props {
  onValidation?: (field: ProfileFields, invalid: boolean) => void;
  fieldStates?: ProfileFieldErrorMap;
  headerAriaLevel?: number;
  disabled?: boolean;
}

export const OnboardingBusinessName = (props: Props): ReactElement => {
  return (
    <OnboardingField
      fieldName="businessName"
      onValidation={props.onValidation}
      error={props.fieldStates ? props.fieldStates.businessName.invalid : false}
      required={true}
      validationText={Defaults.onboardingDefaults.errorTextRequiredBusinessName}
      headerAriaLevel={props.headerAriaLevel}
      disabled={props.disabled}
    />
  );
};

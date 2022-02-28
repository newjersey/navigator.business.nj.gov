import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
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
      validationText={Config.onboardingDefaults.errorTextRequiredBusinessName}
      headerAriaLevel={props.headerAriaLevel}
      disabled={props.disabled}
    />
  );
};

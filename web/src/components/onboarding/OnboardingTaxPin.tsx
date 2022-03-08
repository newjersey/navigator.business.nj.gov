import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, ReactNode } from "react";

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
        validationText={Config.profileDefaults.taxPinErrorText}
        headerAriaLevel={props.headerAriaLevel}
      />
      {props.children}
    </>
  );
};

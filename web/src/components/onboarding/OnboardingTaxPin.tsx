import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, ReactNode } from "react";

interface Props {
  readonly onValidation: (field: ProfileFields, invalid: boolean) => void;
  readonly fieldStates: ProfileFieldErrorMap;
  readonly children?: ReactNode;
  readonly headerAriaLevel?: number;
  readonly handleChangeOverride?: (value: string) => void;
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
        handleChange={props.handleChangeOverride}
      />
      {props.children}
    </>
  );
};

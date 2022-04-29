import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import React, { ReactElement } from "react";

interface Props {
  readonly onValidation: (field: ProfileFields, invalid: boolean) => void;
  readonly fieldStates: ProfileFieldErrorMap;
  readonly headerAriaLevel?: number;
  readonly handleChangeOverride?: (value: string) => void;
}

export const OnboardingTaxId = (props: Props): ReactElement => {
  const fieldName = "taxId";

  return (
    <OnboardingNumericField
      onValidation={props.onValidation}
      error={props.fieldStates[fieldName].invalid}
      fieldName={fieldName}
      maxLength={9}
      headerAriaLevel={props.headerAriaLevel}
      handleChange={props.handleChangeOverride}
    />
  );
};

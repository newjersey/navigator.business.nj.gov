import { NumericField } from "@/components/onboarding/NumericField";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import React, { ReactElement } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
}

export const OnboardingTaxId = (props: Props): ReactElement => {
  const fieldName = "taxId";

  return (
    <NumericField
      onValidation={props.onValidation}
      invalid={props.fieldStates[fieldName].invalid}
      fieldName={fieldName}
      maxLength={9}
    />
  );
};

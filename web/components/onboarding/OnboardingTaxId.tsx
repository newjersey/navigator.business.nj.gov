import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import React, { ReactElement } from "react";
import { NumericField } from "@/components/onboarding/NumericField";

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
      length={9}
    />
  );
};

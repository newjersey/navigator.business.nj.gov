import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  headerAriaLevel?: number;
  required?: boolean;
  handleChangeOverride?: (value: string) => void;
}

export const OnboardingTaxId = (props: Props): ReactElement => {
  const fieldName = "taxId";

  return (
    <OnboardingNumericField
      onValidation={props.onValidation}
      error={props.fieldStates[fieldName].invalid}
      fieldName={fieldName}
      maxLength={9}
      required={props.required}
      headerAriaLevel={props.headerAriaLevel}
      handleChange={props.handleChangeOverride}
    />
  );
};

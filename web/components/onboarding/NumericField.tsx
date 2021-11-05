import { ProfileFields } from "@/lib/types/types";
import React, { FocusEvent, ReactElement } from "react";
import { OnboardingField } from "@/components/onboarding/OnboardingField";
import { OnboardingDefaults } from "@/display-content/onboarding/OnboardingDefaults";
import { templateEval } from "@/lib/utils/helpers";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  invalid: boolean;
  fieldName: ProfileFields;
  length: number;
}

export const NumericField = (props: Props): ReactElement => {
  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const valid = event.target.value.length === props.length || event.target.value.length === 0;
    props.onValidation(props.fieldName, !valid);
  };

  const handleChange = (): void => props.onValidation(props.fieldName, false);

  const regex = (value: string): string => value.replace(/[^0-9]/g, "");

  return (
    <OnboardingField
      fieldName={props.fieldName}
      onValidation={onValidation}
      error={props.invalid}
      validationText={templateEval(OnboardingDefaults.errorTextMinimumNumericField, {
        length: props.length.toString(),
      })}
      visualFilter={regex}
      handleChange={handleChange}
      fieldOptions={{
        inputProps: { inputMode: "numeric", maxLength: props.length },
      }}
    />
  );
};

import { ProfileFields, ProfileFieldErrorMap } from "@/lib/types/types";
import React, { ReactElement, FocusEvent } from "react";
import { OnboardingField } from "./OnboardingField";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { templateEval } from "@/lib/utils/helpers";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
}

export const OnboardingEmployerId = (props: Props): ReactElement => {
  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const valid = event.target.value.length === 10 || event.target.value.length === 0;
    props.onValidation(fieldName, !valid);
  };

  const handleChange = (): void => props.onValidation(fieldName, false);

  const fieldName = "employerId";

  const dataFormat = (value: string): string => value.replace(/[^0-9]/g, "");

  return (
    <OnboardingField
      fieldName={fieldName}
      onValidation={onValidation}
      handleChange={handleChange}
      error={props.fieldStates[fieldName].invalid}
      validationText={templateEval(OnboardingDefaults.errorTextMinimumNumericField, {
        length: "10",
      })}
      valueFilter={dataFormat}
      visualFilter={displayAsEin}
      fieldOptions={{
        inputProps: { inputMode: "numeric", maxLength: "10" },
      }}
    />
  );
};

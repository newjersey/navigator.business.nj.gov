import { OnboardingField } from "@/components/onboarding/OnboardingField";
import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { ProfileFields } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import React, { FocusEvent, ReactElement } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  invalid: boolean;
  fieldName: ProfileFields;
  validationText?: string;
  maxLength: number;
  minLength?: number;
}

export const NumericField = (props: Props): ReactElement => {
  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const userInput = event.target.value.length;

    const valid = props.minLength
      ? userInput >= props.minLength && userInput <= props.maxLength
      : userInput === props.maxLength || userInput === 0;

    props.onValidation(props.fieldName, !valid);
  };

  const handleChange = (): void => props.onValidation(props.fieldName, false);

  const regex = (value: string): string => value.replace(/[^0-9]/g, "");

  return (
    <OnboardingField
      valueFilter={regex}
      fieldName={props.fieldName}
      onValidation={onValidation}
      error={props.invalid}
      validationText={
        props.validationText
          ? props.validationText
          : templateEval(OnboardingDefaults.errorTextMinimumNumericField, {
              length: props.maxLength.toString(),
            })
      }
      visualFilter={regex}
      handleChange={handleChange}
      fieldOptions={{
        inputProps: { inputMode: "numeric", maxLength: props.maxLength },
      }}
    />
  );
};

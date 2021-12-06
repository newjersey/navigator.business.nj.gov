import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { templateEval } from "@/lib/utils/helpers";
import { FormationData } from "@businessnjgovnavigator/shared";
import React, { FocusEvent, ReactElement, useState } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

interface Props {
  fieldName: Exclude<keyof FormationData, "businessSuffix" | "businessStartDate" | "agentNumberOrManual">;
  validationText?: string;
  maxLength: number;
  minLength?: number;
}

export const BusinessFormationNumericField = (props: Props): ReactElement => {
  const [error, setError] = useState(false);

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const userInput = event.target.value.length;

    const valid = props.minLength
      ? userInput >= props.minLength && userInput <= props.maxLength
      : userInput === props.maxLength || userInput === 0;

    valid ? setError(false) : setError(true);
  };

  const regex = (value: string): string => value.replace(/[^0-9]/g, "");

  return (
    <BusinessFormationTextField
      valueFilter={regex}
      fieldName={props.fieldName}
      onValidation={onValidation}
      error={error}
      validationText={
        props.validationText
          ? props.validationText
          : templateEval(OnboardingDefaults.errorTextMinimumNumericField, {
              length: props.maxLength.toString(),
            })
      }
      visualFilter={regex}
      fieldOptions={{
        inputProps: { inputMode: "numeric", maxLength: props.maxLength },
      }}
    />
  );
};

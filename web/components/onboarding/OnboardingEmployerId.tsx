import { ProfileFields, ProfileFieldErrorMap } from "@/lib/types/types";
import React, { ReactElement, FocusEvent } from "react";
import { OnboardingField } from "./OnboardingField";

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

  const regex = (value: string): string => {
    const words = dataFormat(value).split("");
    if (words.length > 2) {
      words.splice(2, 0, "-");
    }
    return words.join("");
  };

  return (
    <OnboardingField
      fieldName={fieldName}
      onValidation={onValidation}
      handleChange={handleChange}
      validationLabel="Error"
      error={props.fieldStates[fieldName].invalid}
      validationText="Must be 9 digits long"
      valueFilter={dataFormat}
      visualFilter={regex}
      fieldOptions={{
        inputProps: { inputMode: "numeric", maxLength: "10" },
      }}
    />
  );
};

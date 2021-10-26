import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import React, { ReactElement, FocusEvent } from "react";
import { OnboardingField } from "./OnboardingField";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
}

export const OnboardingTaxId = (props: Props): ReactElement => {
  const fieldName = "taxId";

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const valid = event.target.value.length === 9 || event.target.value.length === 0;
    props.onValidation(fieldName, !valid);
  };
  const handleChange = (): void => props.onValidation(fieldName, false);

  const regex = (value: string): string => value.replace(/[^0-9]/g, "");

  return (
    <OnboardingField
      fieldName={fieldName}
      onValidation={onValidation}
      handleChange={handleChange}
      error={props.fieldStates[fieldName].invalid}
      validationLabel="Error"
      validationText="Must be 9 digits long"
      visualFilter={regex}
      fieldOptions={{
        inputProps: { inputMode: "numeric", maxLength: "9" },
      }}
    />
  );
};

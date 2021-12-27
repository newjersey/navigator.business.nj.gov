import { FormationTextField } from "@businessnjgovnavigator/shared";
import React, { FocusEvent, ReactElement, useState } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

interface Props {
  fieldName: FormationTextField;
  validationText?: string;
  maxLength: number;
  minLength?: number;
  visualFilter?: (value: string) => string;
}

export const BusinessFormationNumericField = (props: Props): ReactElement => {
  const [error, setError] = useState(false);

  const regex = (value: string): string => value.replace(/[^0-9]/g, "");

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const userInput = event.target.value.length;

    const valid = props.minLength
      ? userInput >= props.minLength && userInput <= props.maxLength
      : userInput === props.maxLength || userInput === 0;

    valid ? setError(false) : setError(true);
  };

  return (
    <BusinessFormationTextField
      valueFilter={regex}
      fieldName={props.fieldName}
      onValidation={onValidation}
      error={error}
      validationText={props.validationText}
      visualFilter={props.visualFilter ? props.visualFilter : regex}
      fieldOptions={{
        inputProps: { inputMode: "numeric", maxLength: props.maxLength },
      }}
    />
  );
};

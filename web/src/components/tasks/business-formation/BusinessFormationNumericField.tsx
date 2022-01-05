import { FormationContext } from "@/components/tasks/BusinessFormation";
import { FormationTextField } from "@businessnjgovnavigator/shared";
import React, { FocusEvent, ReactElement, useContext } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

interface Props {
  fieldName: FormationTextField;
  validationText?: string;
  maxLength: number;
  minLength?: number;
  visualFilter?: (value: string) => string;
  additionalValidation?: (value: string) => boolean;
}

export const BusinessFormationNumericField = ({
  additionalValidation = () => true,
  ...props
}: Props): ReactElement => {
  const { state, setErrorMap } = useContext(FormationContext);

  const regex = (value: string): string => value.replace(/[^0-9]/g, "");

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const userInput = event.target.value;

    const valid = props.minLength
      ? userInput.length >= props.minLength &&
        userInput.length <= props.maxLength &&
        additionalValidation(userInput)
      : false;

    valid
      ? setErrorMap({ ...state.errorMap, [props.fieldName]: { invalid: false } })
      : setErrorMap({ ...state.errorMap, [props.fieldName]: { invalid: true } });
  };

  return (
    <BusinessFormationTextField
      valueFilter={regex}
      fieldName={props.fieldName}
      onValidation={onValidation}
      error={state.errorMap[props.fieldName].invalid}
      validationText={props.validationText}
      visualFilter={props.visualFilter ? props.visualFilter : regex}
      fieldOptions={{
        inputProps: { inputMode: "numeric", maxLength: props.maxLength },
      }}
    />
  );
};

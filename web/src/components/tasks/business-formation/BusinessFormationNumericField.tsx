import { Content } from "@/components/Content";
import { GenericNumericField } from "@/components/GenericNumericField";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { FormationTextField } from "@businessnjgovnavigator/shared";
import React, { ReactElement, useContext } from "react";

interface Props {
  fieldName: FormationTextField;
  validationText?: string;
  maxLength: number;
  minLength?: number;
  visualFilter?: (value: string) => string;
  additionalValidation?: (value: string) => boolean;
}

export const BusinessFormationNumericField = (props: Props): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(FormationContext);

  const handleChange = (value: string): void => {
    const formationFormData = { ...state.formationFormData };
    formationFormData[props.fieldName] = value;
    setFormationFormData({ ...formationFormData });
  };

  const onValidation = (invalid: boolean, fieldName: string) => {
    setErrorMap({ ...state.errorMap, [fieldName]: { invalid } });
  };
  return (
    <>
      <Content>{state.displayContent[props.fieldName].contentMd}</Content>
      <GenericNumericField
        value={state.formationFormData[props.fieldName]}
        placeholder={state.displayContent[props.fieldName].placeholder}
        error={state.errorMap[props.fieldName].invalid}
        handleChange={handleChange}
        onValidation={onValidation}
        {...props}
      />
    </>
  );
};

import { Content } from "@/components/Content";
import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { FormationTextField } from "@businessnjgovnavigator/shared";
import React, { ReactElement, useContext } from "react";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName"> {
  fieldName: Exclude<FormationTextField, "businessName">;
}

export const BusinessFormationTextField = (props: Props): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(FormationContext);

  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
    const formationFormData = { ...state.formationFormData };
    formationFormData[props.fieldName] = value;
    setFormationFormData({ ...formationFormData });
  };

  const onValidation = (fieldName: string, invalid: boolean) => {
    setErrorMap({ ...state.errorMap, [fieldName]: { invalid } });
  };
  return (
    <div>
      <Content>{state.displayContent[props.fieldName].contentMd}</Content>
      <GenericTextField
        value={state.formationFormData[props.fieldName]}
        placeholder={state.displayContent[props.fieldName].placeholder}
        onValidation={onValidation}
        {...props}
        handleChange={handleChange}
        error={props.error ?? state.errorMap[props.fieldName].invalid}
      />
    </div>
  );
};

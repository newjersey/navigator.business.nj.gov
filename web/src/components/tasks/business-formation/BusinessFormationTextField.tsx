import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { FormationTextField } from "@businessnjgovnavigator/shared";
import { TextFieldProps } from "@mui/material";
import React, { ReactElement, useContext } from "react";

interface Props {
  fieldName: FormationTextField;
  fieldOptions?: TextFieldProps;
  onValidation?: (invalid: boolean, fieldName: string) => void;
  additionalValidation?: (value: string) => boolean;
  required?: boolean;
  visualFilter?: (value: string) => string;
  valueFilter?: (value: string) => string;
  handleChange?: () => void;
  error?: boolean;
  validationText?: string;
  disabled?: boolean;
}

export const BusinessFormationTextField = (props: Props): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(FormationContext);

  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange();
    const formationFormData = { ...state.formationFormData };
    formationFormData[props.fieldName] = value;
    setFormationFormData({ ...formationFormData });
  };

  const onValidation = (invalid: boolean, fieldName: string) => {
    setErrorMap({ ...state.errorMap, [fieldName]: { invalid } });
  };
  return (
    <div>
      <Content>{state.displayContent[props.fieldName].contentMd}</Content>
      <GenericTextField
        value={state.formationFormData[props.fieldName]}
        placeholder={state.displayContent[props.fieldName].placeholder}
        handleChange={handleChange}
        error={props.error ?? state.errorMap[props.fieldName].invalid}
        onValidation={props.onValidation ?? onValidation}
        {...props}
      />
    </div>
  );
};

import { Content } from "@/components/Content";
import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { FormationTextField } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName"> {
  fieldName: FormationTextField;
  label: string;
}

export const BusinessFormationTextField = (props: Props): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(BusinessFormationContext);

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
      <Content>{props.label}</Content>
      <GenericTextField
        value={state.formationFormData[props.fieldName]}
        placeholder={props.placeholder}
        onValidation={onValidation}
        {...props}
        handleChange={handleChange}
        error={props.error ?? state.errorMap[props.fieldName].invalid}
        formInputFull
      />
    </div>
  );
};

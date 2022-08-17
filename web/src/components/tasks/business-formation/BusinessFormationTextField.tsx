import { Content } from "@/components/Content";
import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { FormationTextField } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName"> {
  fieldName: FormationTextField;
  label: string;
  inlineErrorStyling?: boolean;
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
    setErrorMap({ ...state.errorMap, [fieldName]: { invalid, name: fieldName } });
  };

  const error = props.error ?? state.errorMap[props.fieldName].invalid;
  return (
    <div>
      <div className={error && !props.inlineErrorStyling ? `input-error-bar` : ""}>
        <Content>{props.label}</Content>
        <GenericTextField
          value={state.formationFormData[props.fieldName]}
          placeholder={props.placeholder}
          onValidation={onValidation}
          {...props}
          handleChange={handleChange}
          error={error}
          formInputFull
        />
      </div>
    </div>
  );
};

import { Content } from "@/components/Content";
import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { FormationTextField } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName"> {
  fieldName: FormationTextField;
  label?: string;
  inlineErrorStyling?: boolean;
}

export const BusinessFormationTextField = ({ className, ...props }: Props): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();

  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
    setFormationFormData((formationFormData) => ({ ...formationFormData, [props.fieldName]: value }));
  };

  const onValidation = () => {
    setFieldsInteracted([props.fieldName]);
  };

  const error = props.error ?? doesFieldHaveError(props.fieldName);
  return (
    <div
      className={`${className ?? ""} ${error ? "error" : ""} ${
        props.inlineErrorStyling ? "" : "input-error-bar"
      }`}
    >
      {props.label && <Content>{props.label}</Content>}
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
  );
};

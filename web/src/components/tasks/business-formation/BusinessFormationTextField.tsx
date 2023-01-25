import { Content } from "@/components/Content";
import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { FormationTextField } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName" | "error"> {
  fieldName: FormationTextField;
  label?: string;
  errorBarType: "ALWAYS" | "MOBILE-ONLY" | "DESKTOP-ONLY" | "NEVER";
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

  const hasError = doesFieldHaveError(props.fieldName);
  return (
    <WithErrorBar className={className ?? ""} hasError={hasError} type={props.errorBarType}>
      {props.label && <Content>{props.label}</Content>}
      <GenericTextField
        value={state.formationFormData[props.fieldName]}
        placeholder={props.placeholder}
        onValidation={onValidation}
        {...props}
        handleChange={handleChange}
        error={hasError}
        formInputFull
      />
    </WithErrorBar>
  );
};

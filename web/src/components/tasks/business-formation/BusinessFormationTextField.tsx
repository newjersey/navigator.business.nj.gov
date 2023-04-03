import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { FormationTextField } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName" | "error"> {
  fieldName: FormationTextField;
  label?: string;
  secondaryLabel?: string;
  errorBarType: "ALWAYS" | "MOBILE-ONLY" | "DESKTOP-ONLY" | "NEVER";
}

export const BusinessFormationTextField = ({ className, ...props }: Props): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();

  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
    setFormationFormData((formationFormData) => ({ ...formationFormData, [props.fieldName]: value }));
  };

  const onValidation = (): void => {
    setFieldsInteracted([props.fieldName]);
  };

  const hasError = doesFieldHaveError(props.fieldName);
  return (
    <WithErrorBar className={className ?? ""} hasError={hasError} type={props.errorBarType}>
      {props.label && (
        <b>
          <ModifiedContent>{props.label}</ModifiedContent>
        </b>
      )}
      {props.secondaryLabel && <span className="margin-left-1">{props.secondaryLabel}</span>}
      <GenericTextField
        value={state.formationFormData[props.fieldName]}
        onValidation={onValidation}
        {...props}
        handleChange={handleChange}
        error={hasError}
        formInputFull
      />
    </WithErrorBar>
  );
};

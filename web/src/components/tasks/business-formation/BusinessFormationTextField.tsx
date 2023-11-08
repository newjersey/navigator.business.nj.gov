import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { FormationTextField } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";
import {useFormContextFieldHelpers} from "@/lib/data-hooks/useFormContextFieldHelpers";
import {FormationFormContext} from "@/contexts/formationFormContext";
import {useMountEffect} from "@/lib/utils/helpers";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName" | "error" | "inputWidth"> {
  fieldName: FormationTextField;
  label?: string;
  secondaryLabel?: string;
  errorBarType: "ALWAYS" | "MOBILE-ONLY" | "DESKTOP-ONLY" | "NEVER";
}

export const BusinessFormationTextField = ({ className, ...props }: Props): ReactElement => {
  const { state, setFormationFormData } = useContext(BusinessFormationContext);

  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
    setFormationFormData((formationFormData) => ({ ...formationFormData, [props.fieldName]: value }));
  };

  const {isFormFieldInvalid } = useFormContextFieldHelpers(props.fieldName, FormationFormContext);

  return (
    <WithErrorBar className={className ?? ""} hasError={isFormFieldInvalid} type={props.errorBarType}>
      {props.label && (
        <strong>
          <ModifiedContent>{props.label}</ModifiedContent>
        </strong>
      )}
      {props.secondaryLabel && <span className="margin-left-1">{props.secondaryLabel}</span>}
      <GenericTextField
        inputWidth={"full"}
        value={state.formationFormData[props.fieldName]}
        {...props}
        handleChange={handleChange}
        formContext={FormationFormContext}
        required={props.required}
        additionalValidationIsValid={props.additionalValidationIsValid}
      />
    </WithErrorBar>
  );
};

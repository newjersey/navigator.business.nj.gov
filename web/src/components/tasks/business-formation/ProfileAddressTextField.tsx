import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressContext } from "@/contexts/addressContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { AddressTextField } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName" | "error" | "inputWidth"> {
  fieldName: AddressTextField;
  label?: string;
  secondaryLabel?: string;
  errorBarType: "ALWAYS" | "MOBILE-ONLY" | "DESKTOP-ONLY" | "NEVER";
}

export const ProfileAddressTextField = ({ className, ...props }: Props): ReactElement => {
  const { state, setAddressData, setFieldsInteracted } = useContext(AddressContext);
  const { doesFieldHaveError } = useAddressErrors();
  const { setIsValid } = useFormContextFieldHelpers(props.fieldName, ProfileFormContext);

  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
    setAddressData((addressData) => ({ ...addressData, [props.fieldName]: value }));
  };

  const onValidation = (): void => {
    setIsValid(!doesFieldHaveError(props.fieldName));
    setFieldsInteracted([props.fieldName]);
  };

  const hasError = doesFieldHaveError(props.fieldName);

  return (
    <WithErrorBar className={className ?? ""} hasError={hasError} type={props.errorBarType}>
      {props.label && (
        <strong>
          <ModifiedContent>{props.label}</ModifiedContent>
        </strong>
      )}
      {props.secondaryLabel && <span className="margin-left-1">{props.secondaryLabel}</span>}
      <GenericTextField
        inputWidth={"full"}
        value={state.addressData[props.fieldName]}
        onValidation={onValidation}
        {...props}
        handleChange={handleChange}
        error={hasError}
      />
    </WithErrorBar>
  );
};

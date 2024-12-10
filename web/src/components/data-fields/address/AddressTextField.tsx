import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressContext } from "@/contexts/addressContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { FormationAddress } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useContext } from "react";

export interface Props extends Omit<GenericTextFieldProps, "value" | "error" | "inputWidth"> {
  fieldName: keyof FormationAddress;
  label?: string;
  secondaryLabel?: string;
  errorBarType: "ALWAYS" | "MOBILE-ONLY" | "DESKTOP-ONLY" | "NEVER";
}

export const AddressTextField = ({ className, ...props }: Props): ReactElement => {
  const { state, setAddressData } = useContext(AddressContext);
  const { doesFieldHaveError } = useAddressErrors();

  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
    setAddressData((prevAddressData) => ({ ...prevAddressData, [props.fieldName]: value }));
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
        value={state.formationAddressData[props.fieldName] as string}
        onValidation={props.onValidation}
        {...props}
        handleChange={handleChange}
        error={hasError}
      />
    </WithErrorBar>
  );
};

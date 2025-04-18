import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressContext } from "@/contexts/addressContext";
import { TaxClearanceCertificateDataContext } from "@/contexts/taxClearanceCertificateDataContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { FormationAddress } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useContext } from "react";

export interface Props extends Omit<GenericTextFieldProps, "value" | "error" | "inputWidth"> {
  fieldName: keyof FormationAddress;
  label?: string;
  secondaryLabel?: string;
  errorBarType: "ALWAYS" | "MOBILE-ONLY" | "DESKTOP-ONLY" | "NEVER";
  required?: boolean | false;
}

export const AddressTextField = ({ className, ...props }: Props): ReactElement => {
  const { state, setAddressData } = useContext(AddressContext);
  const { doesFieldHaveError } = useAddressErrors();
  const { state: taxClearanceCertificateData, setTaxClearanceCertificateData } = useContext(
    TaxClearanceCertificateDataContext
  );

  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
    setAddressData((prevAddressData) => ({ ...prevAddressData, [props.fieldName]: value }));
    if (taxClearanceCertificateData !== undefined) {
      setTaxClearanceCertificateData({
        ...taxClearanceCertificateData,
        [props.fieldName]: value,
      });
    }
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
        required={props.required}
        {...props}
        handleChange={handleChange}
        error={hasError}
      />
    </WithErrorBar>
  );
};

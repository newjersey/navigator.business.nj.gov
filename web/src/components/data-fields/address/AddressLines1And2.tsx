import { AddressTextField } from "@/components/data-fields/address/AddressTextField";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  onValidation: () => void;
  isFullWidth?: boolean;
  required?: boolean;
}
export const AddressLines1And2 = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { getFieldErrorLabel } = useAddressErrors();

  return (
    <>
      <div
        id={`question-addressLine1`}
        className={`${props.isFullWidth ? "" : "text-field-width-default"} add-spacing-on-ele-scroll`}
      >
        <AddressTextField
          label={Config.formation.fields.addressLine1.label}
          fieldName="addressLine1"
          validationText={getFieldErrorLabel("addressLine1")}
          className={"margin-bottom-2"}
          errorBarType="ALWAYS"
          onValidation={props.onValidation}
          required={props.required}
        />
      </div>
      <div
        id={`question-addressLine2`}
        className={`${props.isFullWidth ? "" : "text-field-width-default"} add-spacing-on-ele-scroll`}
      >
        <AddressTextField
          label={Config.formation.fields.addressLine2.label}
          secondaryLabel={Config.formation.general.optionalLabel}
          errorBarType="ALWAYS"
          fieldName="addressLine2"
          validationText={getFieldErrorLabel("addressLine2")}
          className="margin-bottom-2"
          onValidation={props.onValidation}
        />
      </div>
    </>
  );
};

import { AddressTextField } from "@/components/data-fields/address/AddressTextField";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";
import { ScrollableFormFieldWrapper } from "@/components/data-fields/ScrollableFormFieldWrapper";

interface Props {
  onValidation: () => void;
  isFullWidth?: boolean;
  isAddressLine1Invalid?: boolean;
}

export const AddressLines1And2 = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { getFieldErrorLabel } = useAddressErrors();

  return (
    <>
      <ScrollableFormFieldWrapper fieldName={"addressLine1"}>
        <div className={`${props.isFullWidth ? "" : "text-field-width-default"}`}>
          <AddressTextField
            label={Config.formation.fields.addressLine1.label}
            fieldName="addressLine1"
            validationText={getFieldErrorLabel("addressLine1")}
            className={"margin-bottom-2"}
            errorBarType="ALWAYS"
            onValidation={props.onValidation}
            error={props.isAddressLine1Invalid}
          />
        </div>
      </ScrollableFormFieldWrapper>

      <ScrollableFormFieldWrapper fieldName={"addressLine2"}>
        <div className={`${props.isFullWidth ? "" : "text-field-width-default"}`}>
          <AddressTextField
            label={Config.formation.fields.addressLine2.label}
            secondaryLabel={Config.formation.general.optionalLabel}
            errorBarType="ALWAYS"
            fieldName="addressLine2"
            validationText={getFieldErrorLabel("addressLine2")}
            className="margin-bottom-2"
            onValidation={props.onValidation}
            data-testid="addressLine2"
          />
        </div>
      </ScrollableFormFieldWrapper>
    </>
  );
};

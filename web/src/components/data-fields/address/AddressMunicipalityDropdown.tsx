import { MunicipalityDropdown } from "@/components/data-fields/MunicipalityDropdown";
import { AddressContext } from "@/contexts/addressContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { Address, Municipality } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

interface Props {
  onValidation: () => void;
  disabled?: boolean;
}

export const AddressMunicipalityDropdown = (props: Props): ReactElement => {
  const { state, setAddressData } = useContext(AddressContext);
  const { municipalities } = useContext(MunicipalitiesContext);
  const { doesFieldHaveError, getFieldErrorLabel } = useAddressErrors();

  const onSelect = (value: Municipality | undefined): void => {
    setAddressData((previousAddressData: Address): Address => {
      return { ...previousAddressData, addressMunicipality: value };
    });
  };

  return (
    <MunicipalityDropdown
      onValidation={props.onValidation}
      municipalities={municipalities}
      fieldName={"addressMunicipality"}
      error={doesFieldHaveError("addressMunicipality")}
      value={state.addressData.addressMunicipality}
      onSelect={onSelect}
      helperText={getFieldErrorLabel("addressMunicipality")}
      disabled={props.disabled}
    />
  );
};

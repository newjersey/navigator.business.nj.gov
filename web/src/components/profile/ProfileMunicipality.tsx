import { MunicipalityDropdown } from "@/components/data-fields/MunicipalityDropdown";
import { AddressContext } from "@/contexts/addressContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { Municipality } from "@businessnjgovnavigator/shared/municipality";
import { ReactElement, useContext } from "react";

export const ProfileMunicipality = (): ReactElement => {
  const { state, setAddressData, setFieldsInteracted } = useContext(AddressContext);
  const { municipalities } = useContext(MunicipalitiesContext);
  const { doesFieldHaveError, getFieldErrorLabel } = useAddressErrors();

  const onSelect = (value: Municipality | undefined): void => {
    setAddressData((previousAddressData) => {
      return { ...previousAddressData, addressMunicipality: value };
    });
  };

  return (
    <MunicipalityDropdown
      onValidation={(): void => setFieldsInteracted(["addressMunicipality"])}
      municipalities={municipalities}
      fieldName={"addressMunicipality"}
      error={doesFieldHaveError("addressMunicipality")}
      validationLabel="Error"
      value={state.addressData.addressMunicipality}
      onSelect={onSelect}
      helperText={getFieldErrorLabel("addressMunicipality")}
    />
  );
};

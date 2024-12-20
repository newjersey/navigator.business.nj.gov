import { MunicipalityDropdown } from "@/components/data-fields/MunicipalityDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { Municipality } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const FormationMunicipality = (): ReactElement<any> => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { municipalities } = useContext(MunicipalitiesContext);
  const { doesFieldHaveError, getFieldErrorLabel } = useFormationErrors();

  const onSelect = (value: Municipality | undefined): void => {
    setFormationFormData((previousFormationFormData) => {
      return { ...previousFormationFormData, addressMunicipality: value };
    });
  };

  return (
    <MunicipalityDropdown
      onValidation={(): void => setFieldsInteracted(["addressMunicipality"])}
      municipalities={municipalities}
      fieldName={"addressMunicipality"}
      error={doesFieldHaveError("addressMunicipality")}
      validationLabel="Error"
      value={state.formationFormData.addressMunicipality}
      onSelect={onSelect}
      helperText={getFieldErrorLabel("addressMunicipality")}
    />
  );
};

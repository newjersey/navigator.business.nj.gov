import { MunicipalityDropdown } from "@/components/onboarding/MunicipalityDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { Municipality } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const FormationMunicipality = (): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { municipalities } = useContext(MunicipalitiesContext);
  const { doesFieldHaveError, getFieldErrorLabel } = useFormationErrors();

  const onSelect = (value: Municipality | undefined): void => {
    setFormationFormData((previousFormationFormData) => {
      return { ...previousFormationFormData, addressMunicipality: value };
    });
  };

  return (
    <div className="margin-top-2">
      <MunicipalityDropdown
        onValidation={() => setFieldsInteracted(["addressMunicipality"])}
        municipalities={municipalities}
        fieldName={"addressMunicipality"}
        error={doesFieldHaveError("addressMunicipality")}
        validationLabel="Error"
        value={state.formationFormData.addressMunicipality}
        onSelect={onSelect}
        helperText={getFieldErrorLabel("addressMunicipality")}
      />
    </div>
  );
};

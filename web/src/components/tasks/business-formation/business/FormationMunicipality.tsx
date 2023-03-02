import { MunicipalityDropdown } from "@/components/onboarding/MunicipalityDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { Municipality } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const FormationMunicipality = (): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { municipalities } = useContext(MunicipalitiesContext);
  const { Config } = useConfig();
  const { doesFieldHaveError } = useFormationErrors();

  const onSelect = (value: Municipality | undefined): void => {
    setFormationFormData((previousFormationFormData) => {
      return { ...previousFormationFormData, domesticAddressMunicipality: value };
    });
  };

  return (
    <div className="margin-top-2">
      <MunicipalityDropdown
        onValidation={() => setFieldsInteracted(["domesticAddressMunicipality"])}
        municipalities={municipalities}
        fieldName={"domesticAddressMunicipality"}
        error={doesFieldHaveError("domesticAddressMunicipality")}
        validationLabel="Error"
        value={state.formationFormData.domesticAddressMunicipality}
        onSelect={onSelect}
        placeholderText={Config.formation.fields.domesticAddressMunicipality.placeholder}
        helperText={Config.formation.fields.domesticAddressMunicipality.error}
      />
    </div>
  );
};

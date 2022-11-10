import { MunicipalityDropdown } from "@/components/onboarding/MunicipalityDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { Municipality } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const FormationMunicipality = (): ReactElement => {
  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const { municipalities } = useContext(MunicipalitiesContext);
  const { Config } = useConfig();
  const { doesFieldHaveError } = useFormationErrors();

  const onSelect = (value: Municipality | undefined): void => {
    setFormationFormData({ ...state.formationFormData, businessAddressCity: value });
  };

  return (
    <div className="margin-top-2">
      <MunicipalityDropdown
        municipalities={municipalities}
        fieldName={"businessAddressCity"}
        error={doesFieldHaveError("businessAddressCity")}
        validationLabel="Error"
        value={state.formationFormData.businessAddressCity}
        onSelect={onSelect}
        placeholderText={Config.businessFormationDefaults.businessAddressCityPlaceholder}
        helperText={Config.businessFormationDefaults.addressCityErrorText}
      />
    </div>
  );
};

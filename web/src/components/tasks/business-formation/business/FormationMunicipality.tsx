import { MunicipalityDropdown } from "@/components/onboarding/MunicipalityDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { Municipality } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const FormationMunicipality = (): ReactElement => {
  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const { Config } = useConfig();
  const { doesFieldHaveError } = useFormationErrors();

  const onSelect = (value: Municipality | undefined): void => {
    setFormationFormData({ ...state.formationFormData, businessAddressCity: value });
  };

  return (
    <div className="margin-top-2">
      <MunicipalityDropdown
        municipalities={state.municipalities}
        fieldName={"businessAddressCity"}
        error={doesFieldHaveError("businessAddressCity")}
        validationLabel="Error"
        value={state.formationFormData.businessAddressCity}
        onSelect={onSelect}
        placeholderText={Config.businessFormationDefaults.notSetBusinessAddressCityLabel}
        helperText={Config.businessFormationDefaults.addressCityErrorText}
      />
    </div>
  );
};

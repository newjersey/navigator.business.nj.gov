import { MunicipalityDropdown } from "@/components/onboarding/MunicipalityDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Municipality } from "@businessnjgovnavigator/shared/";
import { FocusEvent, ReactElement, useContext } from "react";

export const FormationMunicipality = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const onValidation = (event: FocusEvent<HTMLInputElement>) => {
    setErrorMap({ ...state.errorMap, businessAddressCity: { invalid: !event.target.value.trim() } });
  };

  const onSelect = (value: Municipality | undefined): void => {
    setErrorMap({ ...state.errorMap, businessAddressCity: { invalid: false } });
    setFormationFormData({ ...state.formationFormData, businessAddressCity: value });
  };

  return (
    <div className="margin-top-2">
      <MunicipalityDropdown
        municipalities={state.municipalities}
        onValidation={onValidation}
        fieldName={"businessAddressCity"}
        error={state.errorMap.businessAddressCity.invalid}
        validationLabel="Error"
        handleChange={() => setErrorMap({ ...state.errorMap, businessAddressCity: { invalid: false } })}
        value={state.formationFormData.businessAddressCity}
        onSelect={onSelect}
        placeholderText={Config.businessFormationDefaults.notSetBusinessAddressCityLabel}
        helperText={Config.businessFormationDefaults.addressCityErrorText}
      />
    </div>
  );
};

import { MunicipalityDropdown } from "@/components/onboarding/MunicipalityDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Municipality } from "@businessnjgovnavigator/shared/";
import React, { FocusEvent, ReactElement, useContext } from "react";

export const FormationMunicipality = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(BusinessFormationContext);

  const onValidation = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value.trim()) {
      setErrorMap({ ...state.errorMap, businessAddressCity: { invalid: true } });
    } else if (event.target.value.trim()) {
      setErrorMap({ ...state.errorMap, businessAddressCity: { invalid: false } });
    }
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
        validationText={Config.onboardingDefaults.errorTextRequiredMunicipality}
        handleChange={() => setErrorMap({ ...state.errorMap, businessAddressCity: { invalid: false } })}
        value={state.formationFormData.businessAddressCity}
        onSelect={onSelect}
        placeholderText={Config.businessFormationDefaults.notSetBusinessAddressCityLabel}
      />
    </div>
  );
};

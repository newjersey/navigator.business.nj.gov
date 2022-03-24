import { MunicipalityDropdown } from "@/components/onboarding/MunicipalityDropdown";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Municipality } from "@businessnjgovnavigator/shared";
import React, { FocusEvent, ReactElement, useContext } from "react";

export const BusinessFormationMunicipality = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(FormationContext);

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
  );
};

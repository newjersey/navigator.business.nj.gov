import React, { ReactElement, useContext, FocusEvent } from "react";
import { OnboardingContext } from "@/pages/onboarding";
import { Content } from "@/components/Content";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { MunicipalityDropdown } from "@/components/MunicipalityDropdown";
import { setHeaderRole } from "@/lib/utils/helpers";
import { Municipality } from "@businessnjgovnavigator/shared";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
}

export const OnboardingMunicipality = (props: Props): ReactElement => {
  const { state, setProfileData } = useContext(OnboardingContext);

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const valid = event.target.value.length > 0;
    props.onValidation(fieldName, !valid);
  };

  const handleChange = (): void => props.onValidation(fieldName, false);

  const fieldName = "municipality";

  const onSelect = (value: Municipality | undefined): void => {
    setProfileData({
      ...state.profileData,
      municipality: value,
    });
  };

  const headerLevelTwo = setHeaderRole(2, "h2-element");

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent.municipality.contentMd}</Content>
      <div className="form-input margin-top-2">
        <MunicipalityDropdown
          municipalities={state.municipalities}
          onValidation={onValidation}
          fieldName={fieldName}
          error={props.fieldStates[fieldName].invalid}
          validationLabel="Error"
          validationText={OnboardingDefaults.errorTextRequiredMunicipality}
          handleChange={handleChange}
          value={state.profileData.municipality}
          onSelect={onSelect}
          placeholderText={state.displayContent.municipality.placeholder}
        />

        {isHomeBasedBusinessApplicable(state.profileData.industryId) && (
          <div className="margin-top-3">
            <OnboardingHomeBasedBusiness />
          </div>
        )}
      </div>
    </>
  );
};

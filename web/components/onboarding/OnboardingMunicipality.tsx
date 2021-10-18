import React, { ReactElement, useContext } from "react";
import { OnboardingContext } from "@/pages/onboarding";
import { Municipality } from "@/lib/types/types";
import { Content } from "@/components/Content";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { MunicipalityDropdown } from "@/components/MunicipalityDropdown";
import { setHeaderRole } from "@/lib/utils/helpers";

export const OnboardingMunicipality = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const onSelect = (value: Municipality | undefined): void => {
    setOnboardingData({
      ...state.onboardingData,
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
          value={state.onboardingData.municipality}
          onSelect={onSelect}
          placeholderText={state.displayContent.municipality.placeholder}
        />

        {isHomeBasedBusinessApplicable(state.onboardingData.industryId) && (
          <div className="margin-top-3">
            <OnboardingHomeBasedBusiness />
          </div>
        )}
      </div>
    </>
  );
};

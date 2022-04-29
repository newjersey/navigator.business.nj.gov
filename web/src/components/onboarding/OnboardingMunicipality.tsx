import { Content } from "@/components/Content";
import { MunicipalityDropdown } from "@/components/onboarding/MunicipalityDropdown";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { setHeaderRole } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Municipality } from "@businessnjgovnavigator/shared/";
import React, { FocusEvent, ReactElement, useContext } from "react";

interface Props {
  readonly onValidation: (field: ProfileFields, invalid: boolean) => void;
  readonly fieldStates: ProfileFieldErrorMap;
  readonly h3Heading?: boolean;
  readonly headerAriaLevel?: number;
}

export const OnboardingMunicipality = ({ headerAriaLevel = 2, ...props }: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

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

  const headerLevelTwo = setHeaderRole(headerAriaLevel, "h3-styling");

  const renderHomeBasedBusinessQuestion =
    isHomeBasedBusinessApplicable(state.profileData.industryId) ||
    state.profileData.hasExistingBusiness === true;

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent.municipality.contentMd}</Content>
      <div className="form-input margin-top-2">
        <MunicipalityDropdown
          municipalities={state.municipalities}
          ariaLabel="Location"
          onValidation={onValidation}
          fieldName={fieldName}
          error={props.fieldStates[fieldName].invalid}
          validationLabel="Error"
          validationText={Config.onboardingDefaults.errorTextRequiredMunicipality}
          handleChange={handleChange}
          value={state.profileData.municipality}
          onSelect={onSelect}
          placeholderText={state.displayContent.municipality.placeholder ?? ""}
        />

        {renderHomeBasedBusinessQuestion && (
          <div className="margin-top-3">
            <OnboardingHomeBasedBusiness h3Heading={props.h3Heading} headerAriaLevel={headerAriaLevel} />
          </div>
        )}
      </div>
    </>
  );
};

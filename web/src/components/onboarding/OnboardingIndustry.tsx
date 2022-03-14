import { Content } from "@/components/Content";
import { IndustryDropdown } from "@/components/onboarding/IndustryDropdown";
import { OnboardingCannabisLicense } from "@/components/onboarding/OnboardingCannabisLicense";
import { OnboardingLiquorLicense } from "@/components/onboarding/OnboardingLiquorLicense";
import { isCannabisLicenseApplicable } from "@/lib/domain-logic/isCannabisLicenseApplicable";
import { isLiquorLicenseApplicable } from "@/lib/domain-logic/isLiquorLicenseApplicable";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { setHeaderRole } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { FocusEvent, ReactElement, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  headerAriaLevel?: number;
}

export const OnboardingIndustry = ({ headerAriaLevel = 2, ...props }: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const valid = event.target.value.length > 0;
    props.onValidation(fieldName, !valid);
  };

  const handleChange = (): void => props.onValidation(fieldName, false);

  const fieldName = "industryId";

  const headerLevelTwo = setHeaderRole(headerAriaLevel, "h3-styling");

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent.industryId.contentMd}</Content>
      <div className="form-input margin-top-2">
        <IndustryDropdown
          error={props.fieldStates[fieldName].invalid}
          validationLabel="Error"
          validationText={Config.onboardingDefaults.errorTextRequiredIndustry}
          handleChange={handleChange}
          onValidation={onValidation}
        />

        {state.profileData.industryId === "home-contractor" && (
          <div className="margin-top-2">
            <Content>{state.displayContent.industryId.specificHomeContractorMd}</Content>
          </div>
        )}

        {state.profileData.industryId === "employment-agency" && (
          <div className="margin-top-2">
            <Content>{state.displayContent.industryId.specificEmploymentAgencyMd}</Content>
          </div>
        )}

        {isLiquorLicenseApplicable(state.profileData.industryId) && (
          <div className="margin-top-4">
            <OnboardingLiquorLicense />
          </div>
        )}

        {isCannabisLicenseApplicable(state.profileData.industryId) && (
          <div className="margin-top-4">
            <OnboardingCannabisLicense />
          </div>
        )}
      </div>
    </>
  );
};

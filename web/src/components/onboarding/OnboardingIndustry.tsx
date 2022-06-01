import { Content } from "@/components/Content";
import { IndustryDropdown } from "@/components/onboarding/IndustryDropdown";
import { OnboardingCannabisLicense } from "@/components/onboarding/OnboardingCannabisLicense";
import { OnboardingCpa } from "@/components/onboarding/OnboardingCpa";
import { OnboardingEmploymentAgency } from "@/components/onboarding/OnboardingEmploymentAgency";
import { OnboardingHomeContractor } from "@/components/onboarding/OnboardingHomeContractor";
import { OnboardingLiquorLicense } from "@/components/onboarding/OnboardingLiquorLicense";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { isCannabisLicenseApplicable } from "@/lib/domain-logic/isCannabisLicenseApplicable";
import { isCpaRequiredApplicable } from "@/lib/domain-logic/isCpaRequiredApplicable";
import { isLiquorLicenseApplicable } from "@/lib/domain-logic/isLiquorLicenseApplicable";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { setHeaderRole } from "@/lib/utils/helpers";
import { FocusEvent, ReactElement, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  headerAriaLevel?: number;
}

export const OnboardingIndustry = ({ headerAriaLevel = 2, ...props }: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const valid = event.target.value.length > 0;
    props.onValidation(fieldName, !valid);
  };

  const handleChange = (): void => props.onValidation(fieldName, false);

  const fieldName = "industryId";

  const headerLevelTwo = setHeaderRole(headerAriaLevel, "h3-styling");

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>
        {Config.profileDefaults[state.flow].industryId.header}
      </Content>
      <Content overrides={{ h2: headerLevelTwo }}>
        {Config.profileDefaults[state.flow].industryId.description}
      </Content>
      <div className="form-input margin-top-2">
        <IndustryDropdown
          error={props.fieldStates[fieldName].invalid}
          validationLabel="Error"
          validationText={Config.profileDefaults[state.flow].industryId.errorTextRequired}
          handleChange={handleChange}
          onValidation={onValidation}
        />

        {state.profileData.industryId === "home-contractor" && (
          <div className="margin-top-2" data-testid={`industry-specific-${state.profileData.industryId}`}>
            <OnboardingHomeContractor />
          </div>
        )}

        {state.profileData.industryId === "employment-agency" && (
          <div className="margin-top-2" data-testid={`industry-specific-${state.profileData.industryId}`}>
            <OnboardingEmploymentAgency />
          </div>
        )}

        {isCpaRequiredApplicable(state.profileData.industryId) && (
          <div className="margin-top-4" data-testid={`industry-specific-${state.profileData.industryId}`}>
            <OnboardingCpa />
          </div>
        )}

        {isLiquorLicenseApplicable(state.profileData.industryId) && (
          <div className="margin-top-4" data-testid="liquor-license">
            <OnboardingLiquorLicense />
          </div>
        )}

        {isCannabisLicenseApplicable(state.profileData.industryId) && (
          <div className="margin-top-4" data-testid={`industry-specific-${state.profileData.industryId}`}>
            <OnboardingCannabisLicense />
          </div>
        )}
      </div>
    </>
  );
};

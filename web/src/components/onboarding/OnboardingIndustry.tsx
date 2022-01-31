import { Content } from "@/components/Content";
import { IndustryDropdown } from "@/components/onboarding/IndustryDropdown";
import { OnboardingLiquorLicense } from "@/components/onboarding/OnboardingLiquorLicense";
import { isLiquorLicenseApplicable } from "@/lib/domain-logic/isLiquorLicenseApplicable";
import { setHeaderRole } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import { FormControl, InputLabel } from "@mui/material";
import React, { ReactElement, useContext } from "react";

interface Props {
  headerAriaLevel?: number;
}

export const OnboardingIndustry = ({ headerAriaLevel = 2 }: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  const headerLevelTwo = setHeaderRole(headerAriaLevel, "h3-styling");

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent.industry.contentMd}</Content>
      <div className="form-input margin-top-2">
        <FormControl fullWidth>
          <InputLabel id="industry-label" className="visibility-hidden">
            Industry
          </InputLabel>
          <IndustryDropdown />
        </FormControl>

        {state.profileData.industryId === "home-contractor" && (
          <div className="margin-top-2">
            <Content>{state.displayContent.industry.specificHomeContractorMd}</Content>
          </div>
        )}

        {state.profileData.industryId === "employment-agency" && (
          <div className="margin-top-2">
            <Content>{state.displayContent.industry.specificEmploymentAgencyMd}</Content>
          </div>
        )}

        {isLiquorLicenseApplicable(state.profileData.industryId) && (
          <div className="margin-top-4">
            <OnboardingLiquorLicense />
          </div>
        )}
      </div>
    </>
  );
};

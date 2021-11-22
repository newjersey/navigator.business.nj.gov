import React, { ReactElement, useContext } from "react";
import { FormControl, InputLabel } from "@mui/material";
import { OnboardingContext } from "@/pages/onboarding";
import { Content } from "@/components/Content";
import { OnboardingLiquorLicense } from "@/components/onboarding/OnboardingLiquorLicense";
import { isLiquorLicenseApplicable } from "@/lib/domain-logic/isLiquorLicenseApplicable";
import { setHeaderRole } from "@/lib/utils/helpers";
import { IndustryDropdown } from "@/components/onboarding/IndustryDropdown";

export const OnboardingIndustry = (): ReactElement => {
  const { state } = useContext(OnboardingContext);

  const headerLevelTwo = setHeaderRole(2, "h2-element");

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

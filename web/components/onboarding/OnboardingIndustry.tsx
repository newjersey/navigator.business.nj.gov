import React, { ReactElement, ReactNode, useContext } from "react";
import { Divider, FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { OnboardingContext } from "@/pages/onboarding";
import { Industry } from "@/lib/types/types";
import { ALL_INDUSTRIES_ORDERED, IndustryLookup } from "@/display-content/IndustryLookup";
import { Content } from "@/components/Content";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { OnboardingLiquorLicense } from "@/components/onboarding/OnboardingLiquorLicense";
import { isLiquorLicenseApplicable } from "@/lib/domain-logic/isLiquorLicenseApplicable";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { setHeaderRole } from "@/lib/utils/helpers";

export const OnboardingIndustry = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleIndustry = (event: SelectChangeEvent) => {
    let industry: Industry = "generic";
    if (event.target.value) {
      industry = event.target.value as Industry;
    }

    let homeBasedBusiness = true;
    if (!isHomeBasedBusinessApplicable(industry)) {
      homeBasedBusiness = false;
    } else {
      const wasHomeBasedBusinessPreviouslyApplicable = isHomeBasedBusinessApplicable(
        state.onboardingData.industry
      );
      if (wasHomeBasedBusinessPreviouslyApplicable) {
        homeBasedBusiness = state.onboardingData.homeBasedBusiness;
      }
    }

    setOnboardingData({
      ...state.onboardingData,
      liquorLicense: isLiquorLicenseApplicable(industry) ? state.onboardingData.liquorLicense : false,
      homeBasedBusiness,
      industry,
    });
  };

  const renderOption = (industry: Industry): ReactElement =>
    state.onboardingData.industry === industry ? (
      <div className="padding-top-1 padding-bottom-1">
        <MenuOptionSelected secondaryText={IndustryLookup[industry].secondaryText}>
          {IndustryLookup[industry].primaryText}
        </MenuOptionSelected>
      </div>
    ) : (
      <div className="padding-top-1 padding-bottom-1">
        <MenuOptionUnselected secondaryText={IndustryLookup[industry].secondaryText}>
          {IndustryLookup[industry].primaryText}
        </MenuOptionUnselected>
      </div>
    );

  const renderValue = (value: unknown): ReactNode => {
    if (value === "") {
      return <span className="text-base">{state.displayContent.industry.placeholder}</span>;
    }

    return <>{IndustryLookup[value as Industry].primaryText}</>;
  };

  const headerLevelTwo = setHeaderRole(2, "h2-element");

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent.industry.contentMd}</Content>
      <div className="form-input margin-top-2">
        <FormControl variant="outlined" fullWidth>
          <Select
            fullWidth
            displayEmpty
            value={state.onboardingData.industry || ""}
            onChange={handleIndustry}
            inputProps={{
              "aria-label": "Industry",
              "data-testid": "industry",
            }}
            renderValue={renderValue}
          >
            <MenuItem value="generic" data-testid="generic">
              {renderOption("generic")}
            </MenuItem>
            <Divider style={{ background: "#e6e6e6" }} />
            {ALL_INDUSTRIES_ORDERED.filter((industry) => industry !== "generic").map((industry) => (
              <MenuItem key={industry} value={industry} data-testid={industry}>
                {renderOption(industry)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {state.onboardingData.industry === "home-contractor" && (
          <div className="margin-top-2">
            <Content>{state.displayContent.industry.specificHomeContractorMd}</Content>
          </div>
        )}

        {isLiquorLicenseApplicable(state.onboardingData.industry) && (
          <div className="margin-top-4">
            <OnboardingLiquorLicense />
          </div>
        )}
      </div>
    </>
  );
};

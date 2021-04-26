import React, { ReactElement, ReactNode, useContext } from "react";
import { FormControl, MenuItem, Select } from "@material-ui/core";
import { OnboardingContext } from "../../pages/onboarding";
import { Industry } from "../../lib/types/types";
import { IndustryLookup } from "../../display-content/IndustryLookup";
import { Content } from "../Content";
import { MenuOptionUnselected } from "../MenuOptionUnselected";
import { MenuOptionSelected } from "../MenuOptionSelected";

export const OnboardingIndustry = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleIndustry = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    let industry: Industry = "generic";
    if (event.target.value) {
      industry = event.target.value as Industry;
    }
    setOnboardingData({
      ...state.onboardingData,
      industry,
    });
  };

  const renderOption = (industry: Industry): ReactElement =>
    state.onboardingData.industry === industry ? (
      <MenuOptionSelected>{IndustryLookup[industry]}</MenuOptionSelected>
    ) : (
      <MenuOptionUnselected>{IndustryLookup[industry]}</MenuOptionUnselected>
    );

  return (
    <>
      <Content>{state.displayContent.industry.contentMd}</Content>
      <div className="form-input margin-top-2">
        <FormControl variant="outlined" fullWidth>
          <Select
            fullWidth
            value={state.onboardingData.industry || "generic"}
            onChange={handleIndustry}
            inputProps={{
              "aria-label": "Industry",
              "data-testid": "industry",
            }}
            renderValue={(value: unknown): ReactNode => <>{IndustryLookup[value as Industry]}</>}
          >
            <MenuItem value="generic">{renderOption("generic")}</MenuItem>
            <MenuItem value="restaurant">{renderOption("restaurant")}</MenuItem>
            <MenuItem value="home-contractor">{renderOption("home-contractor")}</MenuItem>
            <MenuItem value="e-commerce">{renderOption("e-commerce")}</MenuItem>
            <MenuItem value="cosmetology">{renderOption("cosmetology")}</MenuItem>
          </Select>
        </FormControl>
      </div>
    </>
  );
};

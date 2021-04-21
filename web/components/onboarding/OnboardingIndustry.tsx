import React, { ReactElement, useContext } from "react";
import { FormControl, MenuItem, Select } from "@material-ui/core";
import { OnboardingContext } from "../../pages/onboarding";
import { Industry } from "../../lib/types/types";
import { IndustryLookup } from "../../display-content/IndustryLookup";

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

  return (
    <>
      <div
        className="usa-prose"
        dangerouslySetInnerHTML={{ __html: state.displayContent.industry.contentHtml }}
      />
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
          >
            <MenuItem value="generic">&nbsp;</MenuItem>
            <MenuItem value="restaurant">{IndustryLookup["restaurant"]}</MenuItem>
            <MenuItem value="home-contractor">{IndustryLookup["home-contractor"]}</MenuItem>
            <MenuItem value="e-commerce">{IndustryLookup["e-commerce"]}</MenuItem>
            <MenuItem value="cosmetology">{IndustryLookup["cosmetology"]}</MenuItem>
          </Select>
        </FormControl>
      </div>
    </>
  );
};

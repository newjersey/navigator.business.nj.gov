import React, { ReactElement, useContext } from "react";
import { createStyles, FormControl, makeStyles, MenuItem, Select } from "@material-ui/core";
import { OnboardingContext } from "../../pages/onboarding";
import { Industry } from "../../lib/types/types";
import { IndustryLookup } from "../../display-content/IndustryLookup";

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      minWidth: "20rem",
    },
  })
);

export const OnboardingIndustry = (): ReactElement => {
  const classes = useStyles();
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
      <h3>{state.displayContent.industry.title}</h3>
      <p>{state.displayContent.industry.description}</p>
      <div className="form-input">
        <FormControl variant="outlined" className={classes.formControl}>
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

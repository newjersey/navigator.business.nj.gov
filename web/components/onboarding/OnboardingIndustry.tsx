import React, { ReactElement, useContext } from "react";
import { createStyles, FormControl, makeStyles, MenuItem, Select } from "@material-ui/core";
import { OnboardingButtonGroup } from "./OnboardingButtonGroup";
import { OnboardingContext } from "../../pages/onboarding";
import { Industry } from "../../lib/types/types";

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      minWidth: "20rem",
    },
  })
);

export const OnboardingIndustry = (): ReactElement => {
  const classes = useStyles();
  const { state, setOnboardingData, onSubmit } = useContext(OnboardingContext);

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
    <form onSubmit={onSubmit} className="usa-prose">
      <h3>Business Industry</h3>
      <p>Which business industry can best describe your company?</p>
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
            <MenuItem value="restaurant">Restaurant</MenuItem>
            <MenuItem value="home-contractor">Home-Improvement Contractor</MenuItem>
            <MenuItem value="e-commerce">E-Commerce</MenuItem>
            <MenuItem value="cosmetology">Cosmetology</MenuItem>
          </Select>
        </FormControl>
      </div>
      <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" />
      <OnboardingButtonGroup />
    </form>
  );
};

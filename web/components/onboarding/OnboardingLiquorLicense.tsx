import React, { ReactElement, useContext } from "react";
import { OnboardingContext } from "@/pages/onboarding";
import { Content } from "@/components/Content";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";

export const OnboardingLiquorLicense = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleLiquorLicenseSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setOnboardingData({
      ...state.onboardingData,
      liquorLicense: event.target.value === "true",
    });
  };

  return (
    <>
      <Content>{state.displayContent.industry.specificLiquorQuestion.contentMd}</Content>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label="Liquor License"
          name="liquor-license"
          value={state.onboardingData.liquorLicense}
          onChange={handleLiquorLicenseSelection}
          row
        >
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="true"
            value={true}
            control={<Radio color="primary" />}
            label={state.displayContent.industry.specificLiquorQuestion.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="false"
            value={false}
            control={<Radio color="primary" />}
            label={state.displayContent.industry.specificLiquorQuestion.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

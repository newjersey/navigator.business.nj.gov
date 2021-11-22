import React, { ReactElement, useContext } from "react";
import { OnboardingContext } from "@/pages/onboarding";
import { Content } from "@/components/Content";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";

export const OnboardingLiquorLicense = (): ReactElement => {
  const { state, setProfileData } = useContext(OnboardingContext);

  const handleLiquorLicenseSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
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
          value={state.profileData.liquorLicense}
          onChange={handleLiquorLicenseSelection}
          row
        >
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="liquor-license-true"
            value={true}
            control={<Radio color="primary" />}
            label={state.displayContent.industry.specificLiquorQuestion.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="liquor-license-false"
            value={false}
            control={<Radio color="primary" />}
            label={state.displayContent.industry.specificLiquorQuestion.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

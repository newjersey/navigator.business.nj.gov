import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingLiquorLicense = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleLiquorLicenseSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      liquorLicense: event.target.value === "true",
    });
  };

  return (
    <>
      <Content>{Config.profileDefaults[state.flow].liquorLicense.header}</Content>
      <Content>{Config.profileDefaults[state.flow].liquorLicense.description}</Content>
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
            label={Config.profileDefaults[state.flow].liquorLicense.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="liquor-license-false"
            value={false}
            control={<Radio color="primary" />}
            label={Config.profileDefaults[state.flow].liquorLicense.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

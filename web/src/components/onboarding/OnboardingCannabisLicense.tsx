import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingCannabisLicense = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleCannabisLicenseSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      cannabisLicenseType: event.target.value as "CONDITIONAL" | "ANNUAL" | undefined,
    });
  };

  return (
    <>
      <div className="margin-bottom-2">
        <Content>{Config.profileDefaults[state.flow].cannabisLicense.header}</Content>
      </div>
      <Content>{Config.profileDefaults[state.flow].cannabisLicense.description}</Content>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label="Cannabis License"
          name="cannabis-license"
          value={state.profileData.cannabisLicenseType || ""}
          onChange={handleCannabisLicenseSelection}
          row
        >
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="cannabis-license-conditional"
            value="CONDITIONAL"
            control={<Radio color="primary" />}
            label={Config.profileDefaults[state.flow].cannabisLicense.radioButtonConditionalText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="cannabis-license-annual"
            value="ANNUAL"
            control={<Radio color="primary" />}
            label={Config.profileDefaults[state.flow].cannabisLicense.radioButtonAnnualText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

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
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label="Cannabis License"
          name="cannabis-license"
          value={state.profileData.cannabisLicenseType || ""}
          onChange={handleCannabisLicenseSelection}
          row
        >
          <FormControlLabel
            style={{ marginTop: ".75rem", alignItems: "flex-start" }}
            labelPlacement="end"
            data-testid="cannabis-license-conditional"
            value="CONDITIONAL"
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].cannabisLicenseType.radioButtonConditionalText}
          />
          <FormControlLabel
            style={{ marginTop: ".75rem", alignItems: "flex-start" }}
            labelPlacement="end"
            data-testid="cannabis-license-annual"
            value="ANNUAL"
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].cannabisLicenseType.radioButtonAnnualText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

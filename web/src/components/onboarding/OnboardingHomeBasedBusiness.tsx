import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingHomeBasedBusiness = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      homeBasedBusiness: event.target.value === "true",
    });
  };

  return (
    <div data-testid="home-based-business-section">
      <FormControl fullWidth>
        <RadioGroup
          aria-label="Home-based Business"
          name="home-based-business"
          value={state.profileData.homeBasedBusiness ?? ""}
          onChange={handleSelection}
          row
        >
          <FormControlLabel
            style={{ marginTop: ".75rem", alignItems: "flex-start", marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="home-based-business-true"
            value={true}
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].homeBasedBusiness.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginTop: ".75rem", alignItems: "flex-start" }}
            labelPlacement="end"
            data-testid="home-based-business-false"
            value={false}
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].homeBasedBusiness.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};

import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingStaffingService = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleProvidesStaffingServiceSelection = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    setProfileData({
      ...state.profileData,
      providesStaffingService: event.target.value === "true",
    });
  };

  return (
    <>
      <div className="margin-bottom-2">
        <Content>{Config.profileDefaults[state.flow].staffingService.header}</Content>
      </div>
      <Content>{Config.profileDefaults[state.flow].staffingService.description}</Content>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label="Liquor License"
          name="liquor-license"
          value={state.profileData.providesStaffingService}
          onChange={handleProvidesStaffingServiceSelection}
          row
        >
          <FormControlLabel
            style={{ marginTop: ".75rem", alignItems: "flex-start", marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="liquor-license-true"
            value={true}
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].staffingService.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginTop: ".75rem", alignItems: "flex-start" }}
            labelPlacement="end"
            data-testid="liquor-license-false"
            value={false}
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].staffingService.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

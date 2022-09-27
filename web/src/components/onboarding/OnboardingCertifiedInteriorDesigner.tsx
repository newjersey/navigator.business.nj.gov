import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingCertifiedInteriorDesigner = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleCertifiedInteriorDesignerSelection = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    setProfileData({
      ...state.profileData,
      certifiedInteriorDesigner: event.target.value === "true",
    });
  };

  return (
    <>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label="Interior Designer"
          name="interior-designer"
          value={state.profileData.certifiedInteriorDesigner}
          onChange={handleCertifiedInteriorDesignerSelection}
          row
        >
          <FormControlLabel
            style={{ marginTop: ".75rem", alignItems: "flex-start", marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="interior-designer-true"
            value={true}
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].certifiedInteriorDesigner.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginTop: ".75rem", alignItems: "flex-start" }}
            labelPlacement="end"
            data-testid="interior-designer-false"
            value={false}
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].certifiedInteriorDesigner.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

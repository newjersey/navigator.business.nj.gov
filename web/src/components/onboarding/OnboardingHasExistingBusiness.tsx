import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { setHeaderRole } from "@/lib/utils/helpers";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingHasExistingBusiness = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      hasExistingBusiness: event.target.value === "true",
    });
  };

  const header = setHeaderRole(2, "h3-styling");

  return (
    <>
      <Content overrides={{ h2: header }}>
        {Config.profileDefaults[state.flow].hasExistingBusiness.header}
      </Content>
      <Content overrides={{ h2: header }}>
        {Config.profileDefaults[state.flow].hasExistingBusiness.description}
      </Content>
      <FormControl fullWidth>
        <RadioGroup
          aria-label="Has Existing Business"
          name="has-existing-business"
          value={state.profileData.hasExistingBusiness ?? ""}
          onChange={handleSelection}
          row
        >
          <FormControlLabel
            aria-label="Has Existing Business - True"
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="has-existing-business-true"
            value={true}
            control={<Radio color="primary" />}
            label={Config.profileDefaults[state.flow].hasExistingBusiness.radioButtonYesText}
          />
          <FormControlLabel
            aria-label="Has Existing Business - False"
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="has-existing-business-false"
            value={false}
            control={<Radio color="primary" />}
            label={Config.profileDefaults[state.flow].hasExistingBusiness.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { setHeaderRole } from "@/lib/utils/helpers";
import { BusinessPersona } from "@businessnjgovnavigator/shared/";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingBusinessPersona = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      businessPersona: event.target.value as BusinessPersona,
    });
  };

  const header = setHeaderRole(2, "h3-styling");

  return (
    <>
      <Content overrides={{ h2: header }}>
        {Config.profileDefaults[state.flow].businessPersona.header}
      </Content>
      <Content overrides={{ h2: header }}>
        {Config.profileDefaults[state.flow].businessPersona.description}
      </Content>
      <FormControl fullWidth>
        <RadioGroup
          aria-label="Business Persona"
          name="business-persona"
          value={state.profileData.businessPersona ?? ""}
          onChange={handleSelection}
          row
        >
          <FormControlLabel
            aria-label="Has Existing Business - True"
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="business-persona-owning"
            value="OWNING"
            control={<Radio color="primary" />}
            label={Config.profileDefaults[state.flow].businessPersona.radioButtonYesText}
          />
          <FormControlLabel
            aria-label="Has Existing Business - False"
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="business-persona-starting"
            value="STARTING"
            control={<Radio color="primary" />}
            label={Config.profileDefaults[state.flow].businessPersona.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

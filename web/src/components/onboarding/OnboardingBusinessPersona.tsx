import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
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

  return (
    <>
      <div role="heading" aria-level={2} className="h3-styling margin-bottom-2">
        {Config.profileDefaults.businessPersona.header}
      </div>
      <Content>{Config.profileDefaults.businessPersona.description}</Content>
      <FormControl fullWidth>
        <RadioGroup
          aria-label="Business Persona"
          name="business-persona"
          value={state.profileData.businessPersona ?? ""}
          onChange={handleSelection}
        >
          <FormControlLabel
            aria-label="Business Status - Starting"
            style={{ marginTop: ".75rem", alignItems: "flex-start" }}
            labelPlacement="end"
            data-testid="business-persona-starting"
            value="STARTING"
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults.businessPersona.radioButtonStartingText}
          />
          <FormControlLabel
            aria-label="Business Status - Owning"
            style={{ marginTop: ".75rem", alignItems: "flex-start" }}
            labelPlacement="end"
            data-testid="business-persona-owning"
            value="OWNING"
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults.businessPersona.radioButtonOwningText}
          />
          <FormControlLabel
            aria-label="Business Status - Foreign"
            style={{ marginTop: ".75rem", alignItems: "flex-start" }}
            labelPlacement="end"
            data-testid="business-persona-foreign"
            value="FOREIGN"
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults.businessPersona.radioButtonForeignText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

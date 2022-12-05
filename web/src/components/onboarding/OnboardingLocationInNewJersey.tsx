import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingLocationInNewJersey = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["nexusLocationInNewJersey"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "nexusLocationInNewJersey",
    });

  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    let hasLocationInNJ;
    event.target.value === "true" ? (hasLocationInNJ = true) : (hasLocationInNJ = false);
    setProfileData({
      ...state.profileData,
      nexusLocationInNewJersey: hasLocationInNJ,
      homeBasedBusiness: hasLocationInNJ ? false : state.profileData.homeBasedBusiness,
    });
  };

  return (
    <>
      <div data-testid="location-in-new-jersey">
        <FormControl fullWidth>
          <RadioGroup
            aria-label="Location in New Jersey"
            name="location-in-new-jersey"
            value={
              state.profileData.nexusLocationInNewJersey === undefined
                ? null
                : state.profileData.nexusLocationInNewJersey
            }
            onChange={handleSelection}
            row
          >
            <FormControlLabel
              style={{ marginRight: "3rem" }}
              labelPlacement="end"
              data-testid="location-in-new-jersey-true"
              value={true}
              control={<Radio color="primary" />}
              label={contentFromConfig.radioButtonYesText}
            />
            <FormControlLabel
              style={{ marginRight: "3rem" }}
              labelPlacement="end"
              data-testid="location-in-new-jersey-false"
              value={false}
              control={<Radio color="primary" />}
              label={contentFromConfig.radioButtonNoText}
            />
          </RadioGroup>
        </FormControl>
      </div>
    </>
  );
};

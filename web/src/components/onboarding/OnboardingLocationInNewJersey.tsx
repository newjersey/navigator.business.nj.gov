import { Content } from "@/components/Content";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { setHeaderRole } from "@/lib/utils/helpers";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingLocationInNewJersey = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const hasLocationInNJ = event.target.value === "true";
    setProfileData({
      ...state.profileData,
      nexusLocationInNewJersey: hasLocationInNJ,
      homeBasedBusiness: hasLocationInNJ ? false : state.profileData.homeBasedBusiness,
    });
  };

  const header = setHeaderRole(2, "h3-styling");

  const renderHomeBasedBusinessQuestion = state.profileData.nexusLocationInNewJersey === false;

  return (
    <>
      <div data-testid="location-in-new-jersey">
        <Content overrides={{ h2: header }}>
          {Config.profileDefaults[state.flow].locationInNewJersey.header}
        </Content>
        <FormControl fullWidth>
          <RadioGroup
            aria-label="Location in New Jersye"
            name="location-in-new-jersey"
            value={
              state.profileData.nexusLocationInNewJersey !== undefined
                ? state.profileData.nexusLocationInNewJersey
                : null
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
              label={Config.profileDefaults[state.flow].locationInNewJersey.radioButtonYesText}
            />
            <FormControlLabel
              style={{ marginRight: "3rem" }}
              labelPlacement="end"
              data-testid="location-in-new-jersey-false"
              value={false}
              control={<Radio color="primary" />}
              label={Config.profileDefaults[state.flow].locationInNewJersey.radioButtonNoText}
            />
          </RadioGroup>
        </FormControl>
      </div>

      {renderHomeBasedBusinessQuestion && (
        <div className="margin-top-3">
          <OnboardingHomeBasedBusiness h3Heading={false} headerAriaLevel={3} />
        </div>
      )}
    </>
  );
};

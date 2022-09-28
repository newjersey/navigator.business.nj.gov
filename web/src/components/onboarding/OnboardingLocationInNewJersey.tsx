import { FieldLabelOnboarding } from "@/components/onboarding/FieldLabelOnboarding";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingLocationInNewJersey = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    let hasLocationInNJ;
    event.target.value === "true" ? (hasLocationInNJ = true) : (hasLocationInNJ = false);
    setProfileData({
      ...state.profileData,
      nexusLocationInNewJersey: hasLocationInNJ,
      homeBasedBusiness: hasLocationInNJ ? false : state.profileData.homeBasedBusiness,
    });
  };

  const renderHomeBasedBusinessQuestion = state.profileData.nexusLocationInNewJersey === false;

  return (
    <>
      <div data-testid="location-in-new-jersey">
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
              label={Config.profileDefaults[state.flow].nexusLocationInNewJersey.radioButtonYesText}
            />
            <FormControlLabel
              style={{ marginRight: "3rem" }}
              labelPlacement="end"
              data-testid="location-in-new-jersey-false"
              value={false}
              control={<Radio color="primary" />}
              label={Config.profileDefaults[state.flow].nexusLocationInNewJersey.radioButtonNoText}
            />
          </RadioGroup>
        </FormControl>
      </div>

      {renderHomeBasedBusinessQuestion && (
        <div className="margin-top-3">
          <FieldLabelOnboarding fieldName="homeBasedBusiness" />
          <OnboardingHomeBasedBusiness />
        </div>
      )}
    </>
  );
};

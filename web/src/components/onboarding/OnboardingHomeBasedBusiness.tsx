import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { setHeaderRole } from "@/lib/utils/helpers";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

interface Props {
  h3Heading?: boolean;
  headerAriaLevel: number;
}

export const OnboardingHomeBasedBusiness = (props: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      homeBasedBusiness: event.target.value === "true",
    });
  };

  const eleSize = props.h3Heading ? "h3-styling" : "h4-styling";
  const header = setHeaderRole(props.headerAriaLevel + 1, eleSize);

  return (
    <div data-testid="home-based-business-section">
      <Content overrides={{ h3: header }}>{Config.profileDefaults[state.flow].homeBased.header}</Content>
      <Content overrides={{ h3: header }}>{Config.profileDefaults[state.flow].homeBased.description}</Content>
      <FormControl fullWidth>
        <RadioGroup
          aria-label="Home-based Business"
          name="home-based-business"
          value={state.profileData.homeBasedBusiness}
          onChange={handleSelection}
          row
        >
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="home-based-business-true"
            value={true}
            control={<Radio color="primary" />}
            label={Config.profileDefaults[state.flow].homeBased.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="home-based-business-false"
            value={false}
            control={<Radio color="primary" />}
            label={Config.profileDefaults[state.flow].homeBased.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};

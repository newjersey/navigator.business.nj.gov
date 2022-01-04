import { Content } from "@/components/Content";
import { setHeaderRole } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

interface Props {
  h3Heading?: boolean;
}

export const OnboardingHomeBasedBusiness = (props: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      homeBasedBusiness: event.target.value === "true",
    });
  };

  const eleSize = props.h3Heading ? "h3-styling" : "h4-styling";
  const header = setHeaderRole(3, eleSize);

  return (
    <>
      <Content overrides={{ h3: header }}>
        {state.displayContent.industry.specificHomeBasedBusinessQuestion.contentMd}
      </Content>
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
            label={state.displayContent.industry.specificHomeBasedBusinessQuestion.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="home-based-business-false"
            value={false}
            control={<Radio color="primary" />}
            label={state.displayContent.industry.specificHomeBasedBusinessQuestion.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

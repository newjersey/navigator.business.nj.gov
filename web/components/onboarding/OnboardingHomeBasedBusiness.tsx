import React, { ReactElement, useContext } from "react";
import { OnboardingContext } from "@/pages/onboarding";
import { Content } from "@/components/Content";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { setHeaderRole } from "@/lib/utils/helpers";

export const OnboardingHomeBasedBusiness = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setOnboardingData({
      ...state.onboardingData,
      homeBasedBusiness: event.target.value === "true",
    });
  };

  const header = setHeaderRole(3, "h3-element");

  return (
    <>
      <Content overrides={{ h3: header }}>
        {state.displayContent.industry.specificHomeBasedBusinessQuestion.contentMd}
      </Content>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label="Home-based Business"
          name="home-based-business"
          value={state.onboardingData.homeBasedBusiness}
          onChange={handleSelection}
          row
        >
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="true"
            value={true}
            control={<Radio color="primary" />}
            label={state.displayContent.industry.specificHomeBasedBusinessQuestion.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="false"
            value={false}
            control={<Radio color="primary" />}
            label={state.displayContent.industry.specificHomeBasedBusinessQuestion.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

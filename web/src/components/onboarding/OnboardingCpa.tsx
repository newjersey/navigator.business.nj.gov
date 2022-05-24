import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingCpa = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleCpaSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    if (event.target.value === "true") {
      analytics.event.onboarding_cpa_question.submit.yes_i_offer_public_accounting();
    } else {
      analytics.event.onboarding_cpa_question.submit.no_i_dont_offer_public_accounting();
    }
    setProfileData({
      ...state.profileData,
      requiresCpa: event.target.value === "true",
    });
  };

  return (
    <>
      <Content>{Config.profileDefaults[state.flow].cpa.header}</Content>
      <Content>{Config.profileDefaults[state.flow].cpa.description}</Content>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label="Certified Public Accountant"
          name="cpa"
          value={state.profileData.requiresCpa}
          onChange={handleCpaSelection}
          row
        >
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="cpa-true"
            value={true}
            control={<Radio color="primary" />}
            label={Config.profileDefaults[state.flow].cpa.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="cpa-false"
            value={false}
            control={<Radio color="primary" />}
            label={Config.profileDefaults[state.flow].cpa.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

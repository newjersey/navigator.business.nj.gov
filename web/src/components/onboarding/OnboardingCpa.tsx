import { Content } from "@/components/Content";
import analytics from "@/lib/utils/analytics";
import { ProfileDataContext } from "@/pages/onboarding";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingCpa = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const handleCpaSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    if (event.target.value === "true") {
      analytics.event.onboarding_cpa_question.selected.offering_public_accounting_services();
    }
    setProfileData({
      ...state.profileData,
      requiresCpa: event.target.value === "true",
    });
  };

  return (
    <>
      <Content>{state.displayContent.industryId.specificCpaQuestion.contentMd}</Content>
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
            label={state.displayContent.industryId.specificCpaQuestion.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="cpa-false"
            value={false}
            control={<Radio color="primary" />}
            label={state.displayContent.industryId.specificCpaQuestion.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

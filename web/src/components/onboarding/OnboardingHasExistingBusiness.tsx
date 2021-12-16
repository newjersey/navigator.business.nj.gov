import { Content } from "@/components/Content";
import { setHeaderRole } from "@/lib/utils/helpers";
import { OnboardingContext } from "@/pages/onboarding";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingHasExistingBusiness = (): ReactElement => {
  const { state, setProfileData } = useContext(OnboardingContext);

  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      hasExistingBusiness: event.target.value === "true",
    });
  };

  const header = setHeaderRole(3, "h3-element");

  return (
    <>
      <Content overrides={{ h3: header }}>{state.displayContent.hasExistingBusiness.contentMd}</Content>
      <FormControl fullWidth>
        <RadioGroup
          aria-label="Has Existing Business"
          name="has-existing-business"
          value={state.profileData.hasExistingBusiness ?? ""}
          onChange={handleSelection}
          row
        >
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="has-existing-business-true"
            value={true}
            control={<Radio color="primary" />}
            label={state.displayContent.hasExistingBusiness.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="has-existing-business-false"
            value={false}
            control={<Radio color="primary" />}
            label={state.displayContent.hasExistingBusiness.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

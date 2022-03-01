import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/pages/onboarding";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingLiquorLicense = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const handleLiquorLicenseSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      liquorLicense: event.target.value === "true",
    });
  };

  return (
    <>
      <Content>{state.displayContent.industryId.specificLiquorQuestion.contentMd}</Content>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label="Liquor License"
          name="liquor-license"
          value={state.profileData.liquorLicense}
          onChange={handleLiquorLicenseSelection}
          row
        >
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="liquor-license-true"
            value={true}
            control={<Radio color="primary" />}
            label={state.displayContent.industryId.specificLiquorQuestion.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="liquor-license-false"
            value={false}
            control={<Radio color="primary" />}
            label={state.displayContent.industryId.specificLiquorQuestion.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

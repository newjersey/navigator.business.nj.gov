import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/pages/onboarding";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingCannabisLicense = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const handleCannabisLicenseSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      cannabisLicenseType: event.target.value as "CONDITIONAL" | "ANNUAL" | undefined,
    });
  };

  return (
    <>
      <Content>{state.displayContent.industryId.specificCannabisLicenseQuestion.contentMd}</Content>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label="Cannabis License"
          name="cannabis-license"
          value={state.profileData.cannabisLicenseType || ""}
          onChange={handleCannabisLicenseSelection}
          row
        >
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="cannabis-license-conditional"
            value="CONDITIONAL"
            control={<Radio color="primary" />}
            label={state.displayContent.industryId.specificCannabisLicenseQuestion.radioButtonConditionalText}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="cannabis-license-annual"
            value="ANNUAL"
            control={<Radio color="primary" />}
            label={state.displayContent.industryId.specificCannabisLicenseQuestion.radioButtonAnnualText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingRealEstateAppraisalManagement = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleRealEstateAppraisalManagementSelection = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    setProfileData({
      ...state.profileData,
      realEstateAppraisalManagement: event.target.value === "true",
    });
  };

  return (
    <>
      <div className="margin-bottom-2">
        <Content>{Config.profileDefaults[state.flow].realEstateAppraisalManagement.header}</Content>
      </div>
      <Content>{Config.profileDefaults[state.flow].realEstateAppraisalManagement.description}</Content>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label="Real Estate Appraisal Management"
          name="real-estate-appraisal"
          value={state.profileData.realEstateAppraisalManagement}
          onChange={handleRealEstateAppraisalManagementSelection}
          row
        >
          <FormControlLabel
            style={{ marginTop: ".75rem", alignItems: "flex-start", marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="real-estate-appraisal-true"
            value={true}
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].realEstateAppraisalManagement.radioButtonYesText}
          />
          <FormControlLabel
            style={{ marginTop: ".75rem", alignItems: "flex-start" }}
            labelPlacement="end"
            data-testid="real-estate-appraisal-false"
            value={false}
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].realEstateAppraisalManagement.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};

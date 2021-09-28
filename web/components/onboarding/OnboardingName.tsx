import React, { ChangeEvent, ReactElement, useContext } from "react";
import { TextField } from "@mui/material";
import { OnboardingContext } from "@/pages/onboarding";
import { Content } from "@/components/Content";
import { setHeaderRole } from "@/lib/utils/helpers";

export const OnboardingBusinessName = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleBusinessName = (event: ChangeEvent<HTMLInputElement>): void => {
    setOnboardingData({
      ...state.onboardingData,
      businessName: event.target.value,
    });
  };

  const headerLevelTwo = setHeaderRole(2, "h2-element");

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent.businessName.contentMd}</Content>
      <div className="form-input margin-top-2">
        <TextField
          value={state.onboardingData.businessName}
          onChange={handleBusinessName}
          variant="outlined"
          fullWidth
          placeholder={state.displayContent.businessName.placeholder}
          inputProps={{
            "aria-label": "Business name",
          }}
        />
      </div>
    </>
  );
};

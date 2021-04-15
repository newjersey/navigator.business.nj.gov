import React, { ChangeEvent, ReactElement, useContext } from "react";
import { TextField } from "@material-ui/core";
import { OnboardingContext } from "../../pages/onboarding";

export const OnboardingBusinessName = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleBusinessName = (event: ChangeEvent<HTMLInputElement>): void => {
    setOnboardingData({
      ...state.onboardingData,
      businessName: event.target.value,
    });
  };

  return (
    <>
      <h3>{state.displayContent.businessName.title}</h3>
      <p>{state.displayContent.businessName.description}</p>
      <div className="form-input">
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
